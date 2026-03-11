import type {
  DrawShapeDraft,
  LayerNodeSource,
  LngLatTuple,
  MapLayerGroupNode,
  MapLayerLeafNode,
  MapLayerNode,
  MapTreeIndex,
  NodeVisibilityState,
  RawMapLayerNode,
} from '../types';

export const MAP_LAYERS_STORAGE_KEY = 'bus-map-layer-tree-v1';
export const MAP_USER_LAYERS_ROOT_NAME = 'User Layers';
const DEFAULT_DOT_COORDINATE: LngLatTuple = [34.7818, 31.2529];
const MINIMUM_LINE_POINT_COUNT = 2;
const MINIMUM_POLYGON_POINT_COUNT = 3;
const CIRCLE_DEFAULT_RADIUS_METERS = 100;

const RUNTIME_ID_ENTROPY_MAX = 1_000_000;

const RESERVED_LEAF_FIELDS = new Set([
  'id',
  'kind',
  'name',
  'children',
  'shape',
  'coordinates',
  'radiusMeters',
  'color',
  'notes',
  'source',
  'allowEdits',
  'metadata',
]);

const RESERVED_GROUP_FIELDS = new Set([
  'id',
  'kind',
  'name',
  'children',
  'source',
  'allowEdits',
  'metadata',
]);

const slugify = (rawText: string) =>
  rawText
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const toFiniteNumber = (value: unknown): number | null => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return null;
  }

  return value;
};

const parseLngLatTuple = (value: unknown): LngLatTuple | null => {
  if (!Array.isArray(value) || value.length < 2) {
    return null;
  }

  const longitude = toFiniteNumber(value[0]);
  const latitude = toFiniteNumber(value[1]);
  if (longitude == null || latitude == null) {
    return null;
  }

  return [longitude, latitude];
};

const parseCoordinatePath = (value: unknown): LngLatTuple[] | null => {
  if (!Array.isArray(value)) {
    return null;
  }

  const coordinates: LngLatTuple[] = [];
  for (const pointValue of value) {
    const point = parseLngLatTuple(pointValue);
    if (point == null) {
      return null;
    }

    coordinates.push(point);
  }

  return coordinates;
};

const normalizeLeafCoordinates = ({
  shape,
  coordinates,
}: {
  shape: MapLayerLeafNode['shape'];
  coordinates: unknown;
}) => {
  if (shape === 'dot' || shape === 'circle') {
    return parseLngLatTuple(coordinates) ?? DEFAULT_DOT_COORDINATE;
  }

  const coordinatePath = parseCoordinatePath(coordinates);
  if (coordinatePath == null) {
    return null;
  }

  const minimumPointCount = shape === 'line' ? MINIMUM_LINE_POINT_COUNT : MINIMUM_POLYGON_POINT_COUNT;
  if (coordinatePath.length < minimumPointCount) {
    return null;
  }

  return coordinatePath;
};

const createPathId = ({
  parentId,
  name,
  siblingIndex,
}: {
  parentId: string | null;
  name: string;
  siblingIndex: number;
}) => {
  const normalizedName = slugify(name) || 'node';
  const leafToken = `${siblingIndex}-${normalizedName}`;
  if (parentId == null) {
    return `root-${leafToken}`;
  }

  return `${parentId}/${leafToken}`;
};

const pickMetadata = ({
  rawNode,
  reservedFields,
}: {
  rawNode: Record<string, unknown>;
  reservedFields: Set<string>;
}) => {
  const metadata: Record<string, unknown> = {};

  for (const [metadataKey, metadataValue] of Object.entries(rawNode)) {
    if (reservedFields.has(metadataKey)) {
      continue;
    }

    metadata[metadataKey] = metadataValue;
  }

  return metadata;
};

const normalizeNodeRecursive = ({
  rawNode,
  parentId,
  siblingIndex,
  fallbackSource,
}: {
  rawNode: RawMapLayerNode;
  parentId: string | null;
  siblingIndex: number;
  fallbackSource: LayerNodeSource;
}): MapLayerNode | null => {
  const nodeName = typeof rawNode.name === 'string' && rawNode.name.trim() !== ''
    ? rawNode.name.trim()
    : `Node ${siblingIndex + 1}`;
  const nodeId =
    typeof rawNode.id === 'string' && rawNode.id.trim() !== ''
      ? rawNode.id
      : createPathId({ parentId, name: nodeName, siblingIndex });
  const nodeSource = rawNode.source ?? fallbackSource;

  if (typeof rawNode.shape === 'string') {
    const leafShape = rawNode.shape as MapLayerLeafNode['shape'];
    const normalizedCoordinates = normalizeLeafCoordinates({
      shape: leafShape,
      coordinates: rawNode.coordinates,
    });
    if (normalizedCoordinates == null) {
      return null;
    }

    const radiusMeters =
      leafShape === 'circle'
        ? toFiniteNumber(rawNode.radiusMeters) ?? CIRCLE_DEFAULT_RADIUS_METERS
        : undefined;

    return {
      id: nodeId,
      kind: 'leaf',
      name: nodeName,
      source: nodeSource,
      shape: leafShape,
      coordinates: normalizedCoordinates,
      radiusMeters,
      color: typeof rawNode.color === 'string' ? rawNode.color : undefined,
      notes: typeof rawNode.notes === 'string' ? rawNode.notes : undefined,
      metadata: pickMetadata({
        rawNode: rawNode as Record<string, unknown>,
        reservedFields: RESERVED_LEAF_FIELDS,
      }),
    };
  }

  const childNodes = Array.isArray(rawNode.children) ? rawNode.children : [];
  const normalizedChildren: MapLayerNode[] = [];

  for (let childIndex = 0; childIndex < childNodes.length; childIndex += 1) {
    const childNode = childNodes[childIndex];
    if (childNode == null || typeof childNode !== 'object') {
      continue;
    }

    const normalizedChildNode = normalizeNodeRecursive({
      rawNode: childNode,
      parentId: nodeId,
      siblingIndex: childIndex,
      fallbackSource,
    });
    if (normalizedChildNode != null) {
      normalizedChildren.push(normalizedChildNode);
    }
  }

  return {
    id: nodeId,
    kind: 'group',
    name: nodeName,
    source: nodeSource,
    allowEdits: rawNode.allowEdits ?? true,
    children: normalizedChildren,
    metadata: pickMetadata({
      rawNode: rawNode as Record<string, unknown>,
      reservedFields: RESERVED_GROUP_FIELDS,
    }),
  };
};

export const normalizeLayerTree = ({
  rawRootNode,
  fallbackSource,
}: {
  rawRootNode: RawMapLayerNode;
  fallbackSource: LayerNodeSource;
}): MapLayerGroupNode => {
  const normalizedRootNode = normalizeNodeRecursive({
    rawNode: rawRootNode,
    parentId: null,
    siblingIndex: 0,
    fallbackSource,
  });

  if (normalizedRootNode == null) {
    return {
      id: 'root-0-map-layers',
      kind: 'group',
      name: 'Map Layers',
      source: fallbackSource,
      allowEdits: true,
      children: [],
      metadata: {},
    };
  }

  if (normalizedRootNode.kind === 'group') {
    return normalizedRootNode;
  }

  return {
    id: 'root-0-map-layers',
    kind: 'group',
    name: 'Map Layers',
    source: fallbackSource,
    allowEdits: true,
    children: [normalizedRootNode],
    metadata: {},
  };
};

const serializeNodeRecursive = (node: MapLayerNode): RawMapLayerNode => {
  if (node.kind === 'group') {
    return {
      id: node.id,
      name: node.name,
      source: node.source,
      allowEdits: node.allowEdits,
      ...node.metadata,
      children: node.children.map((childNode) => serializeNodeRecursive(childNode)),
    };
  }

  const leafNode: RawMapLayerNode = {
    id: node.id,
    name: node.name,
    source: node.source,
    shape: node.shape,
    coordinates: node.coordinates,
    color: node.color,
    notes: node.notes,
    ...node.metadata,
  };

  if (node.shape === 'circle') {
    leafNode.radiusMeters = node.radiusMeters ?? CIRCLE_DEFAULT_RADIUS_METERS;
  }

  return leafNode;
};

export const serializeLayerTree = (rootNode: MapLayerGroupNode): RawMapLayerNode => {
  return serializeNodeRecursive(rootNode);
};

const buildIndexRecursive = ({
  node,
  parentId,
  nodeById,
  parentIdByNodeId,
  leafNodes,
}: {
  node: MapLayerNode;
  parentId: string | null;
  nodeById: Map<string, MapLayerNode>;
  parentIdByNodeId: Map<string, string | null>;
  leafNodes: MapLayerLeafNode[];
}) => {
  nodeById.set(node.id, node);
  parentIdByNodeId.set(node.id, parentId);

  if (node.kind === 'leaf') {
    leafNodes.push(node);
    return;
  }

  for (const childNode of node.children) {
    buildIndexRecursive({
      node: childNode,
      parentId: node.id,
      nodeById,
      parentIdByNodeId,
      leafNodes,
    });
  }
};

export const buildLayerTreeIndex = (rootNode: MapLayerGroupNode): MapTreeIndex => {
  const nodeById = new Map<string, MapLayerNode>();
  const parentIdByNodeId = new Map<string, string | null>();
  const leafNodes: MapLayerLeafNode[] = [];

  buildIndexRecursive({
    node: rootNode,
    parentId: null,
    nodeById,
    parentIdByNodeId,
    leafNodes,
  });

  return {
    nodeById,
    parentIdByNodeId,
    leafNodes,
  };
};

export const createVisibilityLeafSet = (leafNodes: MapLayerLeafNode[]) => {
  const visibleLeafIds = new Set<string>();
  for (const leafNode of leafNodes) {
    visibleLeafIds.add(leafNode.id);
  }

  return visibleLeafIds;
};

const setSubtreeLeafVisibility = ({
  node,
  nextVisible,
  visibleLeafIds,
}: {
  node: MapLayerNode;
  nextVisible: boolean;
  visibleLeafIds: Set<string>;
}) => {
  if (node.kind === 'leaf') {
    if (nextVisible) {
      visibleLeafIds.add(node.id);
      return;
    }

    visibleLeafIds.delete(node.id);
    return;
  }

  for (const childNode of node.children) {
    setSubtreeLeafVisibility({
      node: childNode,
      nextVisible,
      visibleLeafIds,
    });
  }
};

export const updateSubtreeVisibility = ({
  node,
  nextVisible,
  visibleLeafIds,
}: {
  node: MapLayerNode;
  nextVisible: boolean;
  visibleLeafIds: Set<string>;
}) => {
  const nextVisibleLeafIds = new Set(visibleLeafIds);
  setSubtreeLeafVisibility({
    node,
    nextVisible,
    visibleLeafIds: nextVisibleLeafIds,
  });
  return nextVisibleLeafIds;
};

export const getNodeVisibilityState = ({
  node,
  visibleLeafIds,
}: {
  node: MapLayerNode;
  visibleLeafIds: Set<string>;
}): NodeVisibilityState => {
  if (node.kind === 'leaf') {
    return {
      checked: visibleLeafIds.has(node.id),
      indeterminate: false,
    };
  }

  if (node.children.length === 0) {
    return {
      checked: false,
      indeterminate: false,
    };
  }

  const childVisibilityStates = node.children.map((childNode) =>
    getNodeVisibilityState({
      node: childNode,
      visibleLeafIds,
    })
  );

  const allChecked = childVisibilityStates.every((state) => state.checked && !state.indeterminate);
  const anyChecked = childVisibilityStates.some((state) => state.checked || state.indeterminate);

  return {
    checked: allChecked,
    indeterminate: anyChecked && !allChecked,
  };
};

const mapGroupChildren = ({
  node,
  transform,
}: {
  node: MapLayerGroupNode;
  transform: (targetNode: MapLayerNode) => MapLayerNode;
}): MapLayerGroupNode => {
  let didChange = false;
  const mappedChildren = node.children.map((childNode) => {
    const nextNode = transform(childNode);
    if (nextNode !== childNode) {
      didChange = true;
    }

    return nextNode;
  });

  if (!didChange) {
    return node;
  }

  return {
    ...node,
    children: mappedChildren,
  };
};

export const updateLeafNode = ({
  rootNode,
  leafId,
  updater,
}: {
  rootNode: MapLayerGroupNode;
  leafId: string;
  updater: (leafNode: MapLayerLeafNode) => MapLayerLeafNode;
}): MapLayerGroupNode => {
  const transform = (targetNode: MapLayerNode): MapLayerNode => {
    if (targetNode.kind === 'leaf') {
      if (targetNode.id !== leafId) {
        return targetNode;
      }

      return updater(targetNode);
    }

    return mapGroupChildren({
      node: targetNode,
      transform,
    });
  };

  return transform(rootNode) as MapLayerGroupNode;
};

export const deleteLeafNodes = ({
  rootNode,
  leafIdsToDelete,
}: {
  rootNode: MapLayerGroupNode;
  leafIdsToDelete: Set<string>;
}): MapLayerGroupNode => {
  const deleteRecursive = (node: MapLayerNode): MapLayerNode | null => {
    if (node.kind === 'leaf') {
      if (leafIdsToDelete.has(node.id)) {
        return null;
      }

      return node;
    }

    const keptChildren: MapLayerNode[] = [];
    let didChange = false;

    for (const childNode of node.children) {
      const nextNode = deleteRecursive(childNode);
      if (nextNode == null) {
        didChange = true;
        continue;
      }

      if (nextNode !== childNode) {
        didChange = true;
      }

      keptChildren.push(nextNode);
    }

    if (!didChange) {
      return node;
    }

    return {
      ...node,
      children: keptChildren,
    };
  };

  return deleteRecursive(rootNode) as MapLayerGroupNode;
};

const upsertGroupRecursive = ({
  node,
  parentGroupId,
  newGroupNode,
}: {
  node: MapLayerGroupNode;
  parentGroupId: string;
  newGroupNode: MapLayerGroupNode;
}): MapLayerGroupNode => {
  if (node.id === parentGroupId) {
    return {
      ...node,
      children: [...node.children, newGroupNode],
    };
  }

  let didChange = false;
  const nextChildren = node.children.map((childNode) => {
    if (childNode.kind === 'leaf') {
      return childNode;
    }

    const nextChildGroup = upsertGroupRecursive({
      node: childNode,
      parentGroupId,
      newGroupNode,
    });
    if (nextChildGroup !== childNode) {
      didChange = true;
    }

    return nextChildGroup;
  });

  if (!didChange) {
    return node;
  }

  return {
    ...node,
    children: nextChildren,
  };
};

export const createRuntimeNodeId = (name: string) => {
  const normalizedName = slugify(name) || 'node';
  const runtimeEntropy = Math.floor(Math.random() * RUNTIME_ID_ENTROPY_MAX);
  return `runtime-${normalizedName}-${Date.now()}-${runtimeEntropy}`;
};

export const addGroupUnderParent = ({
  rootNode,
  parentGroupId,
  groupName,
  source,
}: {
  rootNode: MapLayerGroupNode;
  parentGroupId: string;
  groupName: string;
  source: LayerNodeSource;
}) => {
  const newGroupNode: MapLayerGroupNode = {
    id: createRuntimeNodeId(groupName),
    kind: 'group',
    name: groupName,
    source,
    allowEdits: true,
    children: [],
    metadata: {},
  };

  return {
    rootNode: upsertGroupRecursive({
      node: rootNode,
      parentGroupId,
      newGroupNode,
    }),
    newGroupId: newGroupNode.id,
  };
};

const appendLeafRecursive = ({
  node,
  targetGroupId,
  leafNode,
}: {
  node: MapLayerGroupNode;
  targetGroupId: string;
  leafNode: MapLayerLeafNode;
}): MapLayerGroupNode => {
  if (node.id === targetGroupId) {
    return {
      ...node,
      children: [...node.children, leafNode],
    };
  }

  let didChange = false;
  const nextChildren = node.children.map((childNode) => {
    if (childNode.kind === 'leaf') {
      return childNode;
    }

    const nextGroupNode = appendLeafRecursive({
      node: childNode,
      targetGroupId,
      leafNode,
    });
    if (nextGroupNode !== childNode) {
      didChange = true;
    }

    return nextGroupNode;
  });

  if (!didChange) {
    return node;
  }

  return {
    ...node,
    children: nextChildren,
  };
};

export const addLeafToGroup = ({
  rootNode,
  targetGroupId,
  leafNode,
}: {
  rootNode: MapLayerGroupNode;
  targetGroupId: string;
  leafNode: MapLayerLeafNode;
}) => {
  return appendLeafRecursive({
    node: rootNode,
    targetGroupId,
    leafNode,
  });
};

export const createLeafNodeFromDraft = ({
  shape,
  coordinates,
  radiusMeters,
  color,
  notes,
  name,
}: {
  shape: DrawShapeDraft['shape'];
  coordinates: DrawShapeDraft['coordinates'];
  radiusMeters?: number;
  color: string;
  notes: string;
  name: string;
}): MapLayerLeafNode => {
  const titlePrefix = shape.charAt(0).toUpperCase() + shape.slice(1);
  const resolvedName = name.trim() === '' ? `${titlePrefix} ${new Date().toISOString()}` : name.trim();

  return {
    id: createRuntimeNodeId(`${shape}-feature`),
    kind: 'leaf',
    name: resolvedName,
    source: 'user',
    shape,
    coordinates,
    radiusMeters: shape === 'circle' ? radiusMeters : undefined,
    color,
    notes,
    metadata: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  };
};

export const ensureUserLayersRoot = ({
  rootNode,
}: {
  rootNode: MapLayerGroupNode;
}) => {
  const existingUserRoot = rootNode.children.find(
    (childNode) => childNode.kind === 'group' && childNode.name === MAP_USER_LAYERS_ROOT_NAME
  ) as MapLayerGroupNode | undefined;

  if (existingUserRoot != null) {
    if (existingUserRoot.allowEdits !== true) {
      existingUserRoot.allowEdits = true;
    }

    return {
      rootNode,
      userLayersRootId: existingUserRoot.id,
    };
  }

  const userLayersRootNode: MapLayerGroupNode = {
    id: createRuntimeNodeId('user-layers-root'),
    kind: 'group',
    name: MAP_USER_LAYERS_ROOT_NAME,
    source: 'user',
    allowEdits: true,
    children: [],
    metadata: {},
  };

  return {
    rootNode: {
      ...rootNode,
      children: [...rootNode.children, userLayersRootNode],
    },
    userLayersRootId: userLayersRootNode.id,
  };
};

export const toRawLeafDataForPopup = (leafNode: MapLayerLeafNode) => {
  const popupMetadata: Record<string, unknown> = {
    ...leafNode.metadata,
  };

  if (leafNode.color) {
    popupMetadata.color = leafNode.color;
  }

  if (leafNode.notes) {
    popupMetadata.notes = leafNode.notes;
  }

  if (leafNode.shape === 'circle' && leafNode.radiusMeters != null) {
    popupMetadata.radiusMeters = leafNode.radiusMeters;
  }

  return popupMetadata;
};

export const createDraftFromLeafNode = (leafNode: MapLayerLeafNode): DrawShapeDraft => ({
  shape: leafNode.shape,
  coordinates: leafNode.coordinates,
  radiusMeters: leafNode.shape === 'circle' ? leafNode.radiusMeters : undefined,
});

export const extractGeometryFromDraftLayer = ({
  layerType,
  layer,
}: {
  layerType: string;
  layer: {
    getLatLngs?: () => unknown;
    getLatLng?: () => { lng: number; lat: number };
    getRadius?: () => number;
  };
}): DrawShapeDraft | null => {
  if (layerType === 'polyline') {
    const linePoints = parseCoordinatePath(
      ((layer.getLatLngs?.() as Array<{ lng: number; lat: number }> | undefined) ?? []).map(
        (latLng) => [latLng.lng, latLng.lat]
      )
    );
    if (!linePoints || linePoints.length < MINIMUM_LINE_POINT_COUNT) {
      return null;
    }

    return {
      shape: 'line',
      coordinates: linePoints,
    };
  }

  if (layerType === 'polygon') {
    const polygonLatLngs = layer.getLatLngs?.();
    const polygonRing =
      Array.isArray(polygonLatLngs) && Array.isArray(polygonLatLngs[0])
        ? (polygonLatLngs[0] as Array<{ lng: number; lat: number }>)
        : [];
    const polygonPoints = parseCoordinatePath(polygonRing.map((latLng) => [latLng.lng, latLng.lat]));
    if (!polygonPoints || polygonPoints.length < MINIMUM_POLYGON_POINT_COUNT) {
      return null;
    }

    return {
      shape: 'polygon',
      coordinates: polygonPoints,
    };
  }

  if (layerType === 'circle') {
    const center = layer.getLatLng?.();
    if (!center) {
      return null;
    }

    return {
      shape: 'circle',
      coordinates: [center.lng, center.lat],
      radiusMeters: toFiniteNumber(layer.getRadius?.()) ?? CIRCLE_DEFAULT_RADIUS_METERS,
    };
  }

  if (layerType === 'marker') {
    const center = layer.getLatLng?.();
    if (!center) {
      return null;
    }

    return {
      shape: 'dot',
      coordinates: [center.lng, center.lat],
    };
  }

  return null;
};
