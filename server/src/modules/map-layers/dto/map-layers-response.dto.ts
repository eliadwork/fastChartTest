import type {
  LayerNodeSource,
  MapLayersSnapshot,
  MapLeafShape,
  RawMapLayerNode,
} from '../map-layers.types';

export class MapLayerNodeResponseDto {
  id?: string;
  name!: string;
  children?: MapLayerNodeResponseDto[];
  shape?: MapLeafShape;
  coordinates?: unknown;
  radiusMeters?: number;
  color?: string;
  notes?: string;
  source?: LayerNodeSource;
  allowEdits?: boolean;
  [metadataKey: string]: unknown;

  static fromNode(node: RawMapLayerNode): MapLayerNodeResponseDto {
    const mappedNode = new MapLayerNodeResponseDto();
    Object.assign(mappedNode, node);

    if (Array.isArray(node.children)) {
      mappedNode.children = node.children.map((childNode) => MapLayerNodeResponseDto.fromNode(childNode));
    }

    return mappedNode;
  }
}

export class MapLayersSnapshotResponseDto {
  revision!: number;
  tree!: MapLayerNodeResponseDto;
  updatedNodeId?: string;

  static fromSnapshot(snapshot: MapLayersSnapshot): MapLayersSnapshotResponseDto {
    const mappedSnapshot = new MapLayersSnapshotResponseDto();
    mappedSnapshot.revision = snapshot.revision;
    mappedSnapshot.tree = MapLayerNodeResponseDto.fromNode(snapshot.tree);
    mappedSnapshot.updatedNodeId = snapshot.updatedNodeId;
    return mappedSnapshot;
  }
}

export class LayerMutationResponseDto {
  snapshot!: MapLayersSnapshotResponseDto;
  layer!: MapLayerNodeResponseDto;

  static create({
    snapshot,
    layer,
  }: {
    snapshot: MapLayersSnapshot;
    layer: RawMapLayerNode;
  }): LayerMutationResponseDto {
    const response = new LayerMutationResponseDto();
    response.snapshot = MapLayersSnapshotResponseDto.fromSnapshot(snapshot);
    response.layer = MapLayerNodeResponseDto.fromNode(layer);
    return response;
  }
}

export class ShapeMutationResponseDto {
  snapshot!: MapLayersSnapshotResponseDto;
  shape!: MapLayerNodeResponseDto;

  static create({
    snapshot,
    shape,
  }: {
    snapshot: MapLayersSnapshot;
    shape: RawMapLayerNode;
  }): ShapeMutationResponseDto {
    const response = new ShapeMutationResponseDto();
    response.snapshot = MapLayersSnapshotResponseDto.fromSnapshot(snapshot);
    response.shape = MapLayerNodeResponseDto.fromNode(shape);
    return response;
  }
}

export class CopyNodeResponseDto {
  snapshot!: MapLayersSnapshotResponseDto;
  copiedNode!: MapLayerNodeResponseDto;

  static create({
    snapshot,
    copiedNode,
  }: {
    snapshot: MapLayersSnapshot;
    copiedNode: RawMapLayerNode;
  }): CopyNodeResponseDto {
    const response = new CopyNodeResponseDto();
    response.snapshot = MapLayersSnapshotResponseDto.fromSnapshot(snapshot);
    response.copiedNode = MapLayerNodeResponseDto.fromNode(copiedNode);
    return response;
  }
}
