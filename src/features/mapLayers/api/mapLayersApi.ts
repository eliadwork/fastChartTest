import type { DrawShapeDraft, RawMapLayerNode } from '../types';

import { MAP_API_BASE_URL } from '../mapLayersConstants';

const MAP_MOCK_DATA_URL = '/data/bus-stops-israel.json';
const USER_LAYERS_ROOT_NAME = 'User Layers';
const OFFLINE_SNAPSHOT_STORAGE_KEY = 'map-layers-offline-snapshot-v1';
const DEFAULT_LAYER_NAME_PREFIX = 'Layer';
const DEFAULT_CIRCLE_RADIUS_METERS = 100;
const MAP_FALLBACK_COLOR = '#00BFFF';

class NetworkRequestError extends Error {
  constructor() {
    super('Network request failed');
    this.name = 'NetworkRequestError';
  }
}

const isLeafNode = (node: RawMapLayerNode) => typeof node.shape === 'string';

const isGroupNode = (node: RawMapLayerNode) => !isLeafNode(node);

const deepClone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const createRuntimeId = (name: string) =>
  `offline-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;

const createBaseId = (name: string, pathTokens: string[]) =>
  `base-${pathTokens.join('-')}-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'node'}`;

export interface MapLayersApiSnapshot {
  revision: number;
  tree: RawMapLayerNode;
  updatedNodeId?: string;
}

export interface CopyNodeApiSnapshot extends MapLayersApiSnapshot {
  copiedNodeId: string;
}

interface LayerMutationApiResponse {
  snapshot: MapLayersApiSnapshot;
  layer: RawMapLayerNode;
}

interface ShapeMutationApiResponse {
  snapshot: MapLayersApiSnapshot;
  shape: RawMapLayerNode;
}

interface CopyNodeApiResponse {
  snapshot: MapLayersApiSnapshot;
  copiedNode: RawMapLayerNode;
}

export interface CreateLayerPayload {
  parentGroupId?: string;
  layerName?: string;
}

export interface UpdateLayerPayload {
  layerName?: string;
  parentGroupId?: string | null;
  allowEdits?: boolean;
}

export interface CreateShapePayload {
  targetGroupId?: string;
  shape: DrawShapeDraft['shape'];
  name?: string;
  geometry: ShapeGeometryPayload;
  radiusMeters?: number;
  color?: string;
  notes?: string;
}

export interface UpdateShapePayload {
  targetGroupId?: string;
  name?: string;
  geometry?: ShapeGeometryPayload;
  radiusMeters?: number;
  color?: string;
  notes?: string;
}

export interface ShapeCoordinatePayload {
  lng: number;
  lat: number;
}

export interface ShapeGeometryPayload {
  point?: ShapeCoordinatePayload;
  path?: ShapeCoordinatePayload[];
}

interface NodeLookupResult {
  node: RawMapLayerNode;
  parent: RawMapLayerNode | null;
  path: RawMapLayerNode[];
}

let offlineSnapshotCache: MapLayersApiSnapshot | null = null;

const getLocalStorage = () => (typeof window !== 'undefined' ? window.localStorage : null);

const saveOfflineSnapshot = (snapshot: MapLayersApiSnapshot) => {
  offlineSnapshotCache = snapshot;
  const localStorageRef = getLocalStorage();
  if (localStorageRef == null) {
    return;
  }

  localStorageRef.setItem(OFFLINE_SNAPSHOT_STORAGE_KEY, JSON.stringify(snapshot));
};

const loadOfflineSnapshotFromStorage = (): MapLayersApiSnapshot | null => {
  const localStorageRef = getLocalStorage();
  if (localStorageRef == null) {
    return null;
  }

  const storedSnapshotText = localStorageRef.getItem(OFFLINE_SNAPSHOT_STORAGE_KEY);
  if (storedSnapshotText == null) {
    return null;
  }

  try {
    return JSON.parse(storedSnapshotText) as MapLayersApiSnapshot;
  } catch {
    return null;
  }
};

const normalizeFallbackNode = ({
  rawNode,
  pathTokens,
  fallbackSource,
}: {
  rawNode: RawMapLayerNode;
  pathTokens: string[];
  fallbackSource: 'mock' | 'user';
}): RawMapLayerNode => {
  const nodeSource = rawNode.source ?? fallbackSource;
  const nodeId =
    typeof rawNode.id === 'string' && rawNode.id.trim() !== ''
      ? rawNode.id
      : createBaseId(rawNode.name, pathTokens);

  if (isLeafNode(rawNode)) {
    return {
      ...rawNode,
      id: nodeId,
      source: nodeSource,
    };
  }

  return {
    ...rawNode,
    id: nodeId,
    source: nodeSource,
    allowEdits: rawNode.allowEdits ?? (nodeSource === 'user'),
    children: (rawNode.children ?? []).map((childNode, childIndex) =>
      normalizeFallbackNode({
        rawNode: childNode,
        pathTokens: [...pathTokens, `${childIndex}`],
        fallbackSource: nodeSource,
      })
    ),
  };
};

const ensureUserRootNode = (rootNode: RawMapLayerNode) => {
  if (!Array.isArray(rootNode.children)) {
    rootNode.children = [];
  }

  const existingUserRootNode = rootNode.children.find(
    (childNode) => isGroupNode(childNode) && childNode.name === USER_LAYERS_ROOT_NAME
  );

  if (existingUserRootNode != null) {
    if (existingUserRootNode.source !== 'user') {
      existingUserRootNode.source = 'user';
    }
    if (existingUserRootNode.allowEdits !== true) {
      existingUserRootNode.allowEdits = true;
    }
    return existingUserRootNode;
  }

  const newUserRootNode: RawMapLayerNode = {
    id: createRuntimeId('user-layers-root'),
    name: USER_LAYERS_ROOT_NAME,
    source: 'user',
    allowEdits: true,
    children: [],
  };
  rootNode.children.push(newUserRootNode);
  return newUserRootNode;
};

const fetchFallbackSnapshot = async (): Promise<MapLayersApiSnapshot> => {
  const response = await fetch(MAP_MOCK_DATA_URL);
  if (!response.ok) {
    throw new Error(`Failed loading map mock data (${response.status})`);
  }

  const rawRootNode = (await response.json()) as RawMapLayerNode;
  const normalizedRootNode = normalizeFallbackNode({
    rawNode: rawRootNode,
    pathTokens: ['root'],
    fallbackSource: 'mock',
  });
  ensureUserRootNode(normalizedRootNode);

  const fallbackSnapshot: MapLayersApiSnapshot = {
    revision: Date.now(),
    tree: normalizedRootNode,
  };

  saveOfflineSnapshot(fallbackSnapshot);
  return fallbackSnapshot;
};

const request = async <TResponse>({
  path,
  method = 'GET',
  body,
}: {
  path: string;
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
}): Promise<TResponse> => {
  let response: Response;
  try {
    response = await fetch(`${MAP_API_BASE_URL}${path}`, {
      method,
      headers:
        body == null
          ? undefined
          : {
              'Content-Type': 'application/json',
            },
      body: body == null ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new NetworkRequestError();
  }

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const parsedError = (await response.json()) as { message?: string | string[] };
      if (Array.isArray(parsedError.message)) {
        message = parsedError.message.join(', ');
      } else if (typeof parsedError.message === 'string' && parsedError.message.trim() !== '') {
        message = parsedError.message;
      }
    } catch {
      // Keep generic message.
    }

    throw new Error(message);
  }

  return (await response.json()) as TResponse;
};

const findNodeById = ({
  currentNode,
  nodeId,
  parentNode,
  path,
}: {
  currentNode: RawMapLayerNode;
  nodeId: string;
  parentNode: RawMapLayerNode | null;
  path: RawMapLayerNode[];
}): NodeLookupResult | null => {
  if (currentNode.id === nodeId) {
    return {
      node: currentNode,
      parent: parentNode,
      path: [...path, currentNode],
    };
  }

  if (!isGroupNode(currentNode) || !Array.isArray(currentNode.children)) {
    return null;
  }

  for (const childNode of currentNode.children) {
    const childResult = findNodeById({
      currentNode: childNode,
      nodeId,
      parentNode: currentNode,
      path: [...path, currentNode],
    });
    if (childResult != null) {
      return childResult;
    }
  }

  return null;
};

const ensureEditablePath = (pathNodes: RawMapLayerNode[]) => {
  for (const pathNode of pathNodes) {
    if (isGroupNode(pathNode) && pathNode.allowEdits === false) {
      throw new Error(`Layer "${pathNode.name}" is locked.`);
    }
  }
};

const getOfflineSnapshot = async () => {
  if (offlineSnapshotCache != null) {
    return deepClone(offlineSnapshotCache);
  }

  const storedSnapshot = loadOfflineSnapshotFromStorage();
  if (storedSnapshot != null) {
    offlineSnapshotCache = storedSnapshot;
    return deepClone(storedSnapshot);
  }

  return fetchFallbackSnapshot();
};

const getOfflineTargetGroup = ({
  rootNode,
  selectedGroupId,
}: {
  rootNode: RawMapLayerNode;
  selectedGroupId?: string | null;
}) => {
  const userRootNode = ensureUserRootNode(rootNode);
  if (selectedGroupId == null || selectedGroupId.trim() === '') {
    return userRootNode;
  }

  const targetLookup = findNodeById({
    currentNode: rootNode,
    nodeId: selectedGroupId,
    parentNode: null,
    path: [],
  });
  if (targetLookup == null) {
    throw new Error(`Layer "${selectedGroupId}" not found.`);
  }

  if (isLeafNode(targetLookup.node)) {
    if (targetLookup.parent == null) {
      return userRootNode;
    }
    return targetLookup.parent;
  }

  return targetLookup.node;
};

const withOfflineMutation = async <TExtra extends object = object>(
  mutationFn: (
    mutableTree: RawMapLayerNode
  ) => {
    updatedNodeId?: string;
  } & TExtra
): Promise<MapLayersApiSnapshot & TExtra> => {
  const currentSnapshot = await getOfflineSnapshot();
  const mutableTree = deepClone(currentSnapshot.tree);

  const mutationResult = mutationFn(mutableTree);
  const nextSnapshot: MapLayersApiSnapshot = {
    revision: Date.now(),
    tree: mutableTree,
    updatedNodeId: mutationResult.updatedNodeId,
  };

  saveOfflineSnapshot(nextSnapshot);
  return {
    ...nextSnapshot,
    ...mutationResult,
  };
};

const cloneNodeAsEditableUser = (sourceNode: RawMapLayerNode): RawMapLayerNode => {
  if (isLeafNode(sourceNode)) {
    return {
      ...deepClone(sourceNode),
      id: createRuntimeId(sourceNode.name),
      source: 'user',
    };
  }

  return {
    ...deepClone(sourceNode),
    id: createRuntimeId(sourceNode.name),
    source: 'user',
    allowEdits: true,
    children: (sourceNode.children ?? []).map((childNode) => cloneNodeAsEditableUser(childNode)),
  };
};

const toPointCoordinates = (point: ShapeCoordinatePayload) => [point.lng, point.lat] as [number, number];

const geometryToCoordinates = ({
  shape,
  geometry,
}: {
  shape: RawMapLayerNode['shape'];
  geometry: ShapeGeometryPayload;
}): DrawShapeDraft['coordinates'] => {
  if (shape == null) {
    throw new Error('Target node does not support geometry updates.');
  }

  if (shape === 'dot' || shape === 'circle') {
    if (geometry.point == null || geometry.path != null) {
      throw new Error(`Shape "${shape}" requires geometry.point only.`);
    }

    return toPointCoordinates(geometry.point);
  }

  if (geometry.path == null || geometry.point != null) {
    throw new Error(`Shape "${shape}" requires geometry.path only.`);
  }

  if (shape === 'line' && geometry.path.length < 2) {
    throw new Error('Line geometry requires at least 2 points.');
  }
  if (shape === 'polygon' && geometry.path.length < 3) {
    throw new Error('Polygon geometry requires at least 3 points.');
  }

  return geometry.path.map(toPointCoordinates);
};

const persistOnlineSnapshot = (snapshot: MapLayersApiSnapshot) => {
  saveOfflineSnapshot(snapshot);
  return snapshot;
};

const isNetworkError = (error: unknown): error is NetworkRequestError => error instanceof NetworkRequestError;

export const fetchMapLayersSnapshot = async () => {
  try {
    const onlineSnapshot = await request<MapLayersApiSnapshot>({
      path: '/map-layers',
    });
    return persistOnlineSnapshot(onlineSnapshot);
  } catch (caughtError) {
    if (!isNetworkError(caughtError)) {
      throw caughtError;
    }

    // During polling, preserve the last known snapshot revision so we only
    // notify on real data changes instead of every network-fallback fetch.
    const cachedSnapshot = await getOfflineSnapshot();
    if (cachedSnapshot != null) {
      return cachedSnapshot;
    }

    return fetchFallbackSnapshot();
  }
};

export const createLayer = async (payload: CreateLayerPayload) => {
  try {
    const onlineResponse = await request<LayerMutationApiResponse>({
      path: '/map-layers/layers',
      method: 'POST',
      body: payload,
    });
    return persistOnlineSnapshot(onlineResponse.snapshot);
  } catch (caughtError) {
    if (!isNetworkError(caughtError)) {
      throw caughtError;
    }

    return withOfflineMutation((tree) => {
      const parentGroupNode = getOfflineTargetGroup({
        rootNode: tree,
        selectedGroupId: payload.parentGroupId,
      });
      const parentLookup =
        parentGroupNode.id == null
          ? null
          : findNodeById({
              currentNode: tree,
              nodeId: parentGroupNode.id,
              parentNode: null,
              path: [],
            });
      if (parentLookup != null) {
        ensureEditablePath(parentLookup.path);
      }

      const layerName = payload.layerName?.trim() || `${DEFAULT_LAYER_NAME_PREFIX} ${new Date().toISOString()}`;
      const createdLayerId = createRuntimeId(layerName);
      const createdLayer: RawMapLayerNode = {
        id: createdLayerId,
        name: layerName,
        source: 'user',
        allowEdits: true,
        children: [],
      };

      if (!Array.isArray(parentGroupNode.children)) {
        parentGroupNode.children = [];
      }
      parentGroupNode.children.push(createdLayer);

      return {
        updatedNodeId: createdLayerId,
      };
    });
  }
};

export const updateLayer = async ({
  layerId,
  payload,
}: {
  layerId: string;
  payload: UpdateLayerPayload;
}) => {
  try {
    const onlineResponse = await request<LayerMutationApiResponse>({
      path: `/map-layers/layers/${layerId}`,
      method: 'PATCH',
      body: payload,
    });
    return persistOnlineSnapshot(onlineResponse.snapshot);
  } catch (caughtError) {
    if (!isNetworkError(caughtError)) {
      throw caughtError;
    }

    return withOfflineMutation((tree) => {
      const targetLayerLookup = findNodeById({
        currentNode: tree,
        nodeId: layerId,
        parentNode: null,
        path: [],
      });
      if (targetLayerLookup == null || isLeafNode(targetLayerLookup.node)) {
        throw new Error(`Layer "${layerId}" not found.`);
      }

      ensureEditablePath(targetLayerLookup.path);

      if (payload.layerName != null && payload.layerName.trim() !== '') {
        targetLayerLookup.node.name = payload.layerName.trim();
      }
      if (payload.allowEdits != null) {
        targetLayerLookup.node.allowEdits = payload.allowEdits;
      }

      if (payload.parentGroupId !== undefined) {
        const nextParentNode = getOfflineTargetGroup({
          rootNode: tree,
          selectedGroupId: payload.parentGroupId,
        });

        const parentLookup = findNodeById({
          currentNode: tree,
          nodeId: nextParentNode.id ?? '',
          parentNode: null,
          path: [],
        });
        if (parentLookup != null) {
          ensureEditablePath(parentLookup.path);
        }
        if (parentLookup != null && parentLookup.path.some((pathNode) => pathNode.id === layerId)) {
          throw new Error('Layer cannot be moved under its descendant.');
        }

        if (targetLayerLookup.parent == null || !Array.isArray(targetLayerLookup.parent.children)) {
          throw new Error('Current parent layer not found.');
        }

        targetLayerLookup.parent.children = targetLayerLookup.parent.children.filter(
          (childNode) => childNode.id !== layerId
        );
        if (!Array.isArray(nextParentNode.children)) {
          nextParentNode.children = [];
        }
        nextParentNode.children.push(targetLayerLookup.node);
      }

      return {
        updatedNodeId: layerId,
      };
    });
  }
};

export const deleteLayer = async (layerId: string) => {
  try {
    const onlineSnapshot = await request<MapLayersApiSnapshot>({
      path: `/map-layers/layers/${layerId}`,
      method: 'DELETE',
    });
    return persistOnlineSnapshot(onlineSnapshot);
  } catch (caughtError) {
    if (!isNetworkError(caughtError)) {
      throw caughtError;
    }

    return withOfflineMutation((tree) => {
      const targetLookup = findNodeById({
        currentNode: tree,
        nodeId: layerId,
        parentNode: null,
        path: [],
      });
      if (targetLookup == null || isLeafNode(targetLookup.node)) {
        throw new Error(`Layer "${layerId}" not found.`);
      }
      ensureEditablePath(targetLookup.path);
      if (targetLookup.parent == null || !Array.isArray(targetLookup.parent.children)) {
        throw new Error('Cannot delete root layer.');
      }

      targetLookup.parent.children = targetLookup.parent.children.filter((childNode) => childNode.id !== layerId);
      return {
        updatedNodeId: targetLookup.parent.id,
      };
    });
  }
};

export const createShape = async (payload: CreateShapePayload) => {
  try {
    const onlineResponse = await request<ShapeMutationApiResponse>({
      path: '/map-layers/shapes',
      method: 'POST',
      body: payload,
    });
    return persistOnlineSnapshot(onlineResponse.snapshot);
  } catch (caughtError) {
    if (!isNetworkError(caughtError)) {
      throw caughtError;
    }

    return withOfflineMutation((tree) => {
      const targetGroupNode = getOfflineTargetGroup({
        rootNode: tree,
        selectedGroupId: payload.targetGroupId,
      });
      const targetGroupLookup = findNodeById({
        currentNode: tree,
        nodeId: targetGroupNode.id ?? '',
        parentNode: null,
        path: [],
      });
      if (targetGroupLookup != null) {
        ensureEditablePath(targetGroupLookup.path);
      }
      const shapeId = createRuntimeId(`${payload.shape}-shape`);
      const shapeName =
        payload.name?.trim() ||
        `${payload.shape.charAt(0).toUpperCase()}${payload.shape.slice(1)} ${new Date().toISOString()}`;

      const shapeNode: RawMapLayerNode = {
        id: shapeId,
        name: shapeName,
        source: 'user',
        shape: payload.shape,
        coordinates: geometryToCoordinates({
          shape: payload.shape,
          geometry: payload.geometry,
        }),
        radiusMeters:
          payload.shape === 'circle'
            ? payload.radiusMeters ?? DEFAULT_CIRCLE_RADIUS_METERS
            : undefined,
        color: payload.color ?? MAP_FALLBACK_COLOR,
        notes: payload.notes ?? '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (!Array.isArray(targetGroupNode.children)) {
        targetGroupNode.children = [];
      }
      targetGroupNode.children.push(shapeNode);

      return {
        updatedNodeId: shapeId,
      };
    });
  }
};

export const updateShape = async ({
  shapeId,
  payload,
}: {
  shapeId: string;
  payload: UpdateShapePayload;
}) => {
  try {
    const onlineResponse = await request<ShapeMutationApiResponse>({
      path: `/map-layers/shapes/${shapeId}`,
      method: 'PATCH',
      body: payload,
    });
    return persistOnlineSnapshot(onlineResponse.snapshot);
  } catch (caughtError) {
    if (!isNetworkError(caughtError)) {
      throw caughtError;
    }

    return withOfflineMutation((tree) => {
      const shapeLookup = findNodeById({
        currentNode: tree,
        nodeId: shapeId,
        parentNode: null,
        path: [],
      });
      if (shapeLookup == null || !isLeafNode(shapeLookup.node)) {
        throw new Error(`Shape "${shapeId}" not found.`);
      }

      if (payload.name != null && payload.name.trim() !== '') {
        shapeLookup.node.name = payload.name.trim();
      }
      if (payload.geometry != null) {
        shapeLookup.node.coordinates = geometryToCoordinates({
          shape: shapeLookup.node.shape,
          geometry: payload.geometry,
        });
      }
      if (payload.color != null) {
        shapeLookup.node.color = payload.color;
      }
      if (payload.notes != null) {
        shapeLookup.node.notes = payload.notes;
      }
      if (shapeLookup.node.shape === 'circle' && payload.radiusMeters != null) {
        shapeLookup.node.radiusMeters = payload.radiusMeters;
      }
      shapeLookup.node.updatedAt = new Date().toISOString();

      if (payload.targetGroupId != null && payload.targetGroupId.trim() !== '') {
        const targetGroupNode = getOfflineTargetGroup({
          rootNode: tree,
          selectedGroupId: payload.targetGroupId,
        });
        if (shapeLookup.parent == null || !Array.isArray(shapeLookup.parent.children)) {
          throw new Error('Shape parent not found.');
        }

        shapeLookup.parent.children = shapeLookup.parent.children.filter((childNode) => childNode.id !== shapeId);
        if (!Array.isArray(targetGroupNode.children)) {
          targetGroupNode.children = [];
        }
        targetGroupNode.children.push(shapeLookup.node);
      }

      return {
        updatedNodeId: shapeId,
      };
    });
  }
};

export const deleteShape = async (shapeId: string) => {
  try {
    const onlineSnapshot = await request<MapLayersApiSnapshot>({
      path: `/map-layers/shapes/${shapeId}`,
      method: 'DELETE',
    });
    return persistOnlineSnapshot(onlineSnapshot);
  } catch (caughtError) {
    if (!isNetworkError(caughtError)) {
      throw caughtError;
    }

    return deleteShapes([shapeId]);
  }
};

export const deleteShapes = async (shapeIds: string[]) => {
  try {
    const onlineSnapshot = await request<MapLayersApiSnapshot>({
      path: '/map-layers/shapes/delete-batch',
      method: 'POST',
      body: {
        shapeIds,
      },
    });
    return persistOnlineSnapshot(onlineSnapshot);
  } catch (caughtError) {
    if (!isNetworkError(caughtError)) {
      throw caughtError;
    }

    return withOfflineMutation((tree) => {
      for (const shapeId of shapeIds) {
        const shapeLookup = findNodeById({
          currentNode: tree,
          nodeId: shapeId,
          parentNode: null,
          path: [],
        });
        if (shapeLookup == null || !isLeafNode(shapeLookup.node)) {
          continue;
        }
        if (shapeLookup.parent != null && Array.isArray(shapeLookup.parent.children)) {
          shapeLookup.parent.children = shapeLookup.parent.children.filter(
            (childNode) => childNode.id !== shapeId
          );
        }
      }

      return {
        updatedNodeId: shapeIds[0],
      };
    });
  }
};

export const copyNodeToUser = async (nodeId: string) => {
  try {
    const onlineResponse = await request<CopyNodeApiResponse>({
      path: '/map-layers/copy-node',
      method: 'POST',
      body: {
        nodeId,
      },
    });
    saveOfflineSnapshot(onlineResponse.snapshot);
    return {
      ...onlineResponse.snapshot,
      copiedNodeId: onlineResponse.copiedNode.id ?? '',
    } satisfies CopyNodeApiSnapshot;
  } catch (caughtError) {
    if (!isNetworkError(caughtError)) {
      throw caughtError;
    }

    return withOfflineMutation<{ copiedNodeId: string }>((tree) => {
      const targetLookup = findNodeById({
        currentNode: tree,
        nodeId,
        parentNode: null,
        path: [],
      });
      if (targetLookup == null) {
        throw new Error(`Node "${nodeId}" not found.`);
      }

      const userRootNode = ensureUserRootNode(tree);
      const copiedNode = cloneNodeAsEditableUser(targetLookup.node);
      if (!Array.isArray(userRootNode.children)) {
        userRootNode.children = [];
      }
      userRootNode.children.push(copiedNode);

      return {
        updatedNodeId: copiedNode.id,
        copiedNodeId: copiedNode.id ?? '',
      };
    }) as Promise<CopyNodeApiSnapshot>;
  }
};
