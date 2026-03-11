export type LayerNodeSource = 'mock' | 'user';

export type MapLeafShape = 'dot' | 'line' | 'polygon' | 'circle';

export type LngLatTuple = [number, number];

export type MapLeafCoordinates = LngLatTuple | LngLatTuple[];

export interface RawMapLayerNode {
  name: string;
  children?: RawMapLayerNode[];
  shape?: MapLeafShape;
  coordinates?: unknown;
  radiusMeters?: number;
  color?: string;
  notes?: string;
  source?: LayerNodeSource;
  [metadataKey: string]: unknown;
}

export interface MapLayerGroupNode {
  id: string;
  kind: 'group';
  name: string;
  source: LayerNodeSource;
  children: MapLayerNode[];
  metadata: Record<string, unknown>;
}

export interface MapLayerLeafNode {
  id: string;
  kind: 'leaf';
  name: string;
  source: LayerNodeSource;
  shape: MapLeafShape;
  coordinates: MapLeafCoordinates;
  radiusMeters?: number;
  color?: string;
  notes?: string;
  metadata: Record<string, unknown>;
}

export type MapLayerNode = MapLayerGroupNode | MapLayerLeafNode;

export interface MapTreeIndex {
  nodeById: Map<string, MapLayerNode>;
  parentIdByNodeId: Map<string, string | null>;
  leafNodes: MapLayerLeafNode[];
}

export interface NodeVisibilityState {
  checked: boolean;
  indeterminate: boolean;
}

export interface DrawShapeDraft {
  shape: MapLeafShape;
  coordinates: MapLeafCoordinates;
  radiusMeters?: number;
}

export interface ShapeDetailsFormValue {
  shapeName: string;
  shape: MapLeafShape;
  coordinatesText: string;
  radiusMeters: string;
  color: string;
  notes: string;
  layerMode: 'existing' | 'new' | 'newSubLayer';
  existingLayerNodeId: string;
  newLayerName: string;
  newSubLayerParentNodeId: string;
  newSubLayerPath: string;
}
