import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  CIRCLE_DEFAULT_RADIUS,
  DEFAULT_LAYER_NAME_PREFIX,
  MAP_FALLBACK_COLOR,
  MERGED_ROOT_ID,
  USER_ROOT_FALLBACK_ID,
} from './map-layers.constants';
import type {
  BatchDeleteShapesRequestDto,
  CopyNodeRequestDto,
  CreateLayerRequestDto,
  CreateShapeRequestDto,
  ShapeGeometryDto,
  UpdateLayerRequestDto,
  UpdateShapeRequestDto,
} from './dto/map-layers-request.dto';
import {
  CopyNodeResponseDto,
  LayerMutationResponseDto,
  MapLayersSnapshotResponseDto,
  ShapeMutationResponseDto,
} from './dto/map-layers-response.dto';
import {
  cloneNodeAsUserEditable,
  createRuntimeId,
  deepClone,
  findNodeRecursive,
  isGroupNode,
  isLeafNode,
  pathContainsNode,
} from './map-layers.helpers';
import { MapLayersRepository } from './map-layers.repository';
import type {
  MapLayersMutableState,
  MapLayersSnapshot,
  MapLeafCoordinates,
  RawMapLayerNode,
  TreeLookupResult,
} from './map-layers.types';

interface MutationResult<TValue> {
  value: TValue;
  updatedNodeId?: string;
}

@Injectable()
export class MapLayersService {
  private mutationQueue: Promise<void> = Promise.resolve();

  constructor(private readonly mapLayersRepository: MapLayersRepository) {}

  getTreeSnapshot(): MapLayersSnapshotResponseDto {
    const snapshot = this.readCurrentSnapshot();
    return MapLayersSnapshotResponseDto.fromSnapshot(snapshot);
  }

  async createLayer(payload: CreateLayerRequestDto): Promise<LayerMutationResponseDto> {
    const mutation = await this.runMutation((state) => {
      const parentGroup = this.resolveEditableGroupTarget({
        userRoot: state.userRoot,
        parentGroupId: payload.parentGroupId,
      });
      const layerName = payload.layerName?.trim() || `${DEFAULT_LAYER_NAME_PREFIX} ${new Date().toISOString()}`;

      const newLayer: RawMapLayerNode = {
        id: createRuntimeId(layerName),
        name: layerName,
        source: 'user',
        allowEdits: true,
        children: [],
      };

      if (!Array.isArray(parentGroup.children)) {
        parentGroup.children = [];
      }
      parentGroup.children.push(newLayer);

      return {
        value: newLayer,
        updatedNodeId: newLayer.id,
      };
    });

    return LayerMutationResponseDto.create({
      snapshot: mutation.snapshot,
      layer: mutation.value,
    });
  }

  async updateLayer(
    layerId: string,
    payload: UpdateLayerRequestDto
  ): Promise<LayerMutationResponseDto> {
    const mutation = await this.runMutation((state) => {
      const mergedTree = this.createMergedTree({
        baseRoot: state.baseRoot,
        userRoot: state.userRoot,
      });

      const selectedLayerResult = findNodeRecursive({
        currentNode: mergedTree,
        targetId: layerId,
        parent: null,
        pathNodes: [],
      });
      if (selectedLayerResult == null || !isGroupNode(selectedLayerResult.node)) {
        throw new NotFoundException(`Layer "${layerId}" not found.`);
      }
      if (selectedLayerResult.node.source !== 'user') {
        throw new BadRequestException('Base layers are immutable.');
      }
      if (selectedLayerResult.node.id === state.userRoot.id) {
        throw new BadRequestException('User root layer cannot be moved or deleted.');
      }
      this.ensureEditablePath(selectedLayerResult.path);

      const userLayer = this.findUserNodeById(state.userRoot, layerId);
      if (userLayer == null || !isGroupNode(userLayer.node)) {
        throw new NotFoundException(`Layer "${layerId}" not found in editable tree.`);
      }

      if (payload.layerName != null && payload.layerName.trim() !== '') {
        userLayer.node.name = payload.layerName.trim();
      }

      if (payload.allowEdits != null) {
        userLayer.node.allowEdits = payload.allowEdits;
      }

      if (payload.parentGroupId !== undefined) {
        const targetParentNode = this.resolveEditableGroupTarget({
          userRoot: state.userRoot,
          parentGroupId: payload.parentGroupId,
        });

        if (targetParentNode.id === userLayer.node.id) {
          throw new BadRequestException('Layer cannot be moved under itself.');
        }

        const targetParentLookup = this.findUserNodeById(
          state.userRoot,
          targetParentNode.id ?? USER_ROOT_FALLBACK_ID
        );
        if (
          targetParentLookup != null &&
          pathContainsNode(targetParentLookup.path, userLayer.node.id ?? '')
        ) {
          throw new BadRequestException('Layer cannot be moved under its own descendant.');
        }

        if (userLayer.parent == null || !isGroupNode(userLayer.parent)) {
          throw new BadRequestException('Cannot resolve current parent layer.');
        }

        if (userLayer.parent.id !== targetParentNode.id) {
          userLayer.parent.children = (userLayer.parent.children ?? []).filter(
            (childNode) => childNode.id !== userLayer.node.id
          );
          if (!Array.isArray(targetParentNode.children)) {
            targetParentNode.children = [];
          }
          targetParentNode.children.push(userLayer.node);
        }
      }

      return {
        value: userLayer.node,
        updatedNodeId: userLayer.node.id,
      };
    });

    return LayerMutationResponseDto.create({
      snapshot: mutation.snapshot,
      layer: mutation.value,
    });
  }

  async deleteLayer(layerId: string): Promise<MapLayersSnapshotResponseDto> {
    const mutation = await this.runMutation((state) => {
      const layerLookup = this.findUserNodeById(state.userRoot, layerId);
      if (layerLookup == null || !isGroupNode(layerLookup.node)) {
        throw new NotFoundException(`Layer "${layerId}" not found.`);
      }
      if (layerLookup.node.id === state.userRoot.id) {
        throw new BadRequestException('User root layer cannot be deleted.');
      }
      this.ensureEditablePath(layerLookup.path);

      if (layerLookup.parent == null || !isGroupNode(layerLookup.parent)) {
        throw new BadRequestException('Parent layer not found.');
      }
      layerLookup.parent.children = (layerLookup.parent.children ?? []).filter(
        (childNode) => childNode.id !== layerLookup.node.id
      );

      return {
        value: undefined,
        updatedNodeId: layerLookup.parent.id,
      };
    });

    return MapLayersSnapshotResponseDto.fromSnapshot(mutation.snapshot);
  }

  async createShape(payload: CreateShapeRequestDto): Promise<ShapeMutationResponseDto> {
    const mutation = await this.runMutation((state) => {
      const targetGroup = this.resolveEditableGroupTarget({
        userRoot: state.userRoot,
        parentGroupId: payload.targetGroupId,
      });
      this.ensureEditablePath(this.findUserPath(state.userRoot, targetGroup.id ?? '') ?? []);

      const coordinates = this.resolveCreateCoordinates(payload);
      const shapeName =
        payload.name?.trim() ||
        `${payload.shape.charAt(0).toUpperCase()}${payload.shape.slice(1)} ${new Date().toISOString()}`;

      const newShape: RawMapLayerNode = {
        id: createRuntimeId(`${shapeName}-shape`),
        name: shapeName,
        source: 'user',
        shape: payload.shape,
        coordinates,
        radiusMeters: payload.shape === 'circle' ? payload.radiusMeters ?? CIRCLE_DEFAULT_RADIUS : undefined,
        color: payload.color ?? MAP_FALLBACK_COLOR,
        notes: payload.notes ?? '',
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      if (!Array.isArray(targetGroup.children)) {
        targetGroup.children = [];
      }
      targetGroup.children.push(newShape);

      return {
        value: newShape,
        updatedNodeId: newShape.id,
      };
    });

    return ShapeMutationResponseDto.create({
      snapshot: mutation.snapshot,
      shape: mutation.value,
    });
  }

  async updateShape(
    shapeId: string,
    payload: UpdateShapeRequestDto
  ): Promise<ShapeMutationResponseDto> {
    const mutation = await this.runMutation((state) => {
      const shapeLookup = this.findUserNodeById(state.userRoot, shapeId);
      if (shapeLookup == null || !isLeafNode(shapeLookup.node)) {
        throw new NotFoundException(`Shape "${shapeId}" not found.`);
      }
      this.ensureEditablePath(shapeLookup.path);

      if (payload.name != null && payload.name.trim() !== '') {
        shapeLookup.node.name = payload.name.trim();
      }
      if (payload.color != null) {
        shapeLookup.node.color = payload.color;
      }
      if (payload.notes != null) {
        shapeLookup.node.notes = payload.notes;
      }
      if (payload.geometry != null) {
        shapeLookup.node.coordinates = this.resolveCoordinatesForExistingShape(
          shapeLookup.node.shape,
          payload.geometry
        );
      }
      if (shapeLookup.node.shape === 'circle' && payload.radiusMeters != null) {
        shapeLookup.node.radiusMeters = payload.radiusMeters;
      }

      if (payload.targetGroupId !== undefined) {
        const targetGroup = this.resolveEditableGroupTarget({
          userRoot: state.userRoot,
          parentGroupId: payload.targetGroupId,
        });
        if (shapeLookup.parent == null || !isGroupNode(shapeLookup.parent)) {
          throw new BadRequestException('Current parent layer not found.');
        }

        if (shapeLookup.parent.id !== targetGroup.id) {
          shapeLookup.parent.children = (shapeLookup.parent.children ?? []).filter(
            (childNode) => childNode.id !== shapeLookup.node.id
          );
          if (!Array.isArray(targetGroup.children)) {
            targetGroup.children = [];
          }
          targetGroup.children.push(shapeLookup.node);
        }
      }

      shapeLookup.node.updatedAt = new Date().toISOString();

      return {
        value: shapeLookup.node,
        updatedNodeId: shapeLookup.node.id,
      };
    });

    return ShapeMutationResponseDto.create({
      snapshot: mutation.snapshot,
      shape: mutation.value,
    });
  }

  async deleteShape(shapeId: string): Promise<MapLayersSnapshotResponseDto> {
    return this.deleteShapes({
      shapeIds: [shapeId],
    });
  }

  async deleteShapes(
    payload: BatchDeleteShapesRequestDto
  ): Promise<MapLayersSnapshotResponseDto> {
    const shapeIds = payload.shapeIds.filter((shapeId) => shapeId.trim() !== '');
    if (shapeIds.length === 0) {
      return this.getTreeSnapshot();
    }

    const mutation = await this.runMutation((state) => {
      for (const shapeId of shapeIds) {
        const shapeLookup = this.findUserNodeById(state.userRoot, shapeId);
        if (shapeLookup == null || !isLeafNode(shapeLookup.node)) {
          continue;
        }

        this.ensureEditablePath(shapeLookup.path);
        if (shapeLookup.parent != null && isGroupNode(shapeLookup.parent)) {
          shapeLookup.parent.children = (shapeLookup.parent.children ?? []).filter(
            (childNode) => childNode.id !== shapeLookup.node.id
          );
        }
      }

      return {
        value: undefined,
        updatedNodeId: shapeIds[0],
      };
    });

    return MapLayersSnapshotResponseDto.fromSnapshot(mutation.snapshot);
  }

  async copyNodeToUser(payload: CopyNodeRequestDto): Promise<CopyNodeResponseDto> {
    const mutation = await this.runMutation((state) => {
      const mergedTree = this.createMergedTree({
        baseRoot: state.baseRoot,
        userRoot: state.userRoot,
      });

      const targetLookup = findNodeRecursive({
        currentNode: mergedTree,
        targetId: payload.nodeId,
        parent: null,
        pathNodes: [],
      });
      if (targetLookup == null) {
        throw new NotFoundException(`Node "${payload.nodeId}" not found.`);
      }

      const copiedNode = cloneNodeAsUserEditable(targetLookup.node);
      if (!Array.isArray(state.userRoot.children)) {
        state.userRoot.children = [];
      }
      state.userRoot.children.push(copiedNode);

      return {
        value: copiedNode,
        updatedNodeId: copiedNode.id,
      };
    });

    return CopyNodeResponseDto.create({
      snapshot: mutation.snapshot,
      copiedNode: mutation.value,
    });
  }

  private readCurrentSnapshot(updatedNodeId?: string): MapLayersSnapshot {
    const baseRoot = this.mapLayersRepository.readBaseTree();
    const userStore = this.mapLayersRepository.readUserStore();

    return this.createSnapshot({
      baseRoot,
      userRoot: userStore.userRoot,
      revision: userStore.revision,
      updatedNodeId,
    });
  }

  private runMutation<TValue>(
    mutation: (state: MapLayersMutableState) => MutationResult<TValue>
  ): Promise<{ value: TValue; snapshot: MapLayersSnapshot }> {
    const operation = this.mutationQueue.then(async () => {
      const baseRoot = this.mapLayersRepository.readBaseTree();
      const userStore = this.mapLayersRepository.readUserStore();
      const state: MapLayersMutableState = {
        baseRoot,
        userRoot: userStore.userRoot,
      };

      const mutationResult = mutation(state);
      const nextRevision = Date.now();

      this.mapLayersRepository.saveUserStore({
        revision: nextRevision,
        userRoot: state.userRoot,
      });

      return {
        value: mutationResult.value,
        snapshot: this.createSnapshot({
          baseRoot: state.baseRoot,
          userRoot: state.userRoot,
          revision: nextRevision,
          updatedNodeId: mutationResult.updatedNodeId,
        }),
      };
    });

    this.mutationQueue = operation.then(
      () => undefined,
      () => undefined
    );

    return operation;
  }

  private createSnapshot({
    baseRoot,
    userRoot,
    revision,
    updatedNodeId,
  }: {
    baseRoot: RawMapLayerNode;
    userRoot: RawMapLayerNode;
    revision: number;
    updatedNodeId?: string;
  }): MapLayersSnapshot {
    return {
      revision,
      tree: this.createMergedTree({
        baseRoot,
        userRoot,
      }),
      updatedNodeId,
    };
  }

  private createMergedTree({
    baseRoot,
    userRoot,
  }: {
    baseRoot: RawMapLayerNode;
    userRoot: RawMapLayerNode;
  }): RawMapLayerNode {
    return {
      id: MERGED_ROOT_ID,
      name: baseRoot.name,
      source: 'mock',
      allowEdits: false,
      children: [...(baseRoot.children ?? []), deepClone(userRoot)],
    };
  }

  private findUserNodeById(userRoot: RawMapLayerNode, nodeId: string): TreeLookupResult | null {
    return findNodeRecursive({
      currentNode: userRoot,
      targetId: nodeId,
      parent: null,
      pathNodes: [],
    });
  }

  private findUserPath(userRoot: RawMapLayerNode, nodeId: string): RawMapLayerNode[] | null {
    const nodeLookup = this.findUserNodeById(userRoot, nodeId);
    return nodeLookup?.path ?? null;
  }

  private resolveEditableGroupTarget({
    userRoot,
    parentGroupId,
  }: {
    userRoot: RawMapLayerNode;
    parentGroupId?: string | null;
  }) {
    if (parentGroupId == null || parentGroupId.trim() === '' || parentGroupId === MERGED_ROOT_ID) {
      return userRoot;
    }

    const groupLookup = this.findUserNodeById(userRoot, parentGroupId);
    if (groupLookup == null || !isGroupNode(groupLookup.node)) {
      throw new NotFoundException(`Target layer "${parentGroupId}" not found.`);
    }
    this.ensureEditablePath(groupLookup.path);
    return groupLookup.node;
  }

  private ensureEditablePath(pathNodes: RawMapLayerNode[]) {
    for (const pathNode of pathNodes) {
      if (isGroupNode(pathNode) && pathNode.allowEdits === false) {
        throw new BadRequestException(`Layer "${pathNode.name}" is locked for edits.`);
      }
    }
  }

  private resolveCreateCoordinates(payload: CreateShapeRequestDto): MapLeafCoordinates {
    const shape = payload.shape;
    const geometry = payload.geometry;

    if (shape === 'dot' || shape === 'circle') {
      if (geometry.point == null || geometry.path != null) {
        throw new BadRequestException(`Shape "${shape}" requires geometry.point only.`);
      }

      return [geometry.point.lng, geometry.point.lat];
    }

    if (geometry.path == null || geometry.point != null) {
      throw new BadRequestException(`Shape "${shape}" requires geometry.path only.`);
    }

    if (shape === 'line' && geometry.path.length < 2) {
      throw new BadRequestException('Line requires at least 2 coordinate points.');
    }

    if (shape === 'polygon' && geometry.path.length < 3) {
      throw new BadRequestException('Polygon requires at least 3 coordinate points.');
    }

    return geometry.path.map((point): [number, number] => [point.lng, point.lat]);
  }

  private resolveCoordinatesForExistingShape(
    shape: RawMapLayerNode['shape'],
    geometry: ShapeGeometryDto
  ): MapLeafCoordinates {
    if (shape == null) {
      throw new BadRequestException('Only shape nodes can update geometry.');
    }

    if (shape === 'dot' || shape === 'circle') {
      if (geometry.point == null || geometry.path != null) {
        throw new BadRequestException(`Shape "${shape}" requires geometry.point only.`);
      }

      return [geometry.point.lng, geometry.point.lat];
    }

    if (geometry.path == null || geometry.point != null) {
      throw new BadRequestException(`Shape "${shape}" requires geometry.path only.`);
    }

    if (shape === 'line' && geometry.path.length < 2) {
      throw new BadRequestException('Line requires at least 2 coordinate points.');
    }

    if (shape === 'polygon' && geometry.path.length < 3) {
      throw new BadRequestException('Polygon requires at least 3 coordinate points.');
    }

    return geometry.path.map((point): [number, number] => [point.lng, point.lat]);
  }
}
