export type LayerNodeSource = 'mock' | 'user';
export type MapLeafShape = 'dot' | 'line' | 'polygon' | 'circle';

export type LngLatTuple = [number, number];
export type MapLeafCoordinates = LngLatTuple | LngLatTuple[];

export interface RawMapLayerNode {
  id?: string;
  name: string;
  children?: RawMapLayerNode[];
  shape?: MapLeafShape;
  coordinates?: unknown;
  radiusMeters?: number;
  color?: string;
  notes?: string;
  source?: LayerNodeSource;
  allowEdits?: boolean;
  [metadataKey: string]: unknown;
}

export interface MapLayersSnapshot {
  revision: number;
  tree: RawMapLayerNode;
  updatedNodeId?: string;
}

export interface UserStorePayload {
  revision: number;
  userRoot: RawMapLayerNode;
}

export interface TreeLookupResult {
  node: RawMapLayerNode;
  parent: RawMapLayerNode | null;
  path: RawMapLayerNode[];
}

export interface MapLayersMutableState {
  baseRoot: RawMapLayerNode;
  userRoot: RawMapLayerNode;
}
