import type { DrawShapeDraft, MapLayerLeafNode } from '../types';

import { Fragment, useEffect, useMemo, useRef } from 'react';
import type { RefObject } from 'react';
import L from 'leaflet';
import 'leaflet-draw';
import {
  Circle,
  FeatureGroup,
  MapContainer,
  Marker,
  Polygon,
  Polyline,
  TileLayer,
  Tooltip,
  useMap,
} from 'react-leaflet';

import {
  MAP_DASH_PATTERN,
  MAP_DEFAULT_CENTER_LAT,
  MAP_DEFAULT_CENTER_LNG,
  MAP_DEFAULT_ZOOM,
  MAP_FALLBACK_COLOR,
  MAP_HOVER_CARD_BACKGROUND_COLOR,
  MAP_LINE_WEIGHT,
  MAP_TILE_ATTRIBUTION,
  MAP_TILE_URL,
} from '../mapLayersConstants';
import { MapShapeSymbol } from './MapShapeSymbol';
import {
  extractGeometryFromDraftLayer,
  toRawLeafDataForPopup,
} from '../utils/mapLayerTreeUtils';
import {
  MapInfoCard,
  MapInfoCardGrid,
  MapInfoCardKey,
  MapInfoCardTitle,
  MapInfoCardTitleRow,
  MapInfoCardValue,
} from '../MapLayersStyled';

type LayerWithNodeId = L.Layer & { __mapLeafNodeId?: string };

const toLatLng = ([longitude, latitude]: [number, number]): [number, number] => [latitude, longitude];

const toPathLatLngs = (coordinates: [number, number][]) => coordinates.map(toLatLng);

const createDotIcon = (color: string) =>
  L.divIcon({
    html: `<span style="display:block;width:12px;height:12px;border-radius:50%;background:${color};border:2px solid rgba(255,255,255,0.9)"></span>`,
    className: 'map-dot-icon',
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  });

const getLeafColor = (leafNode: MapLayerLeafNode) => {
  if (leafNode.color && leafNode.color.trim() !== '') {
    return leafNode.color;
  }

  return MAP_FALLBACK_COLOR;
};

const getLeafDataEntries = ({
  leafNode,
  includeCoordinates,
}: {
  leafNode: MapLayerLeafNode;
  includeCoordinates: boolean;
}) => {
  const leafDataEntries = Object.entries(toRawLeafDataForPopup(leafNode)).filter(
    ([metadataKey]) => metadataKey !== 'coordinates'
  );
  const valuesWithLabels: Array<[string, string | number | boolean]> = [['shape', leafNode.shape]];

  if (includeCoordinates) {
    const coordinatesValue =
      leafNode.shape === 'dot' || leafNode.shape === 'circle'
        ? `[${(leafNode.coordinates as [number, number]).join(', ')}]`
        : JSON.stringify(leafNode.coordinates);
    valuesWithLabels.push(['coordinates', coordinatesValue]);
  }

  for (const [key, value] of leafDataEntries) {
    valuesWithLabels.push([key, String(value)]);
  }

  return valuesWithLabels;
};

const LeafInfoCard = ({
  leafNode,
  includeCoordinates,
  hoverVariant,
}: {
  leafNode: MapLayerLeafNode;
  includeCoordinates: boolean;
  hoverVariant?: boolean;
}) => {
  const dataEntries = getLeafDataEntries({
    leafNode,
    includeCoordinates,
  });

  return (
    <MapInfoCard
      style={
        hoverVariant
          ? {
              backgroundColor: MAP_HOVER_CARD_BACKGROUND_COLOR,
              borderColor: 'rgba(255, 255, 255, 0.25)',
              color: '#EAF4FF',
            }
          : undefined
      }
    >
      <MapInfoCardTitle>
        <MapInfoCardTitleRow>
          <MapShapeSymbol shape={leafNode.shape} color={leafNode.color} variant="card" />
          <span>{leafNode.name}</span>
        </MapInfoCardTitleRow>
      </MapInfoCardTitle>
      <MapInfoCardGrid>
        {dataEntries.map(([key, value]) => (
          <Fragment key={`${leafNode.id}-${key}`}>
            <MapInfoCardKey style={hoverVariant ? { color: '#BFD8F2' } : undefined}>
              {key}
            </MapInfoCardKey>
            <MapInfoCardValue style={hoverVariant ? { color: '#F2F8FF' } : undefined}>
              {String(value)}
            </MapInfoCardValue>
          </Fragment>
        ))}
      </MapInfoCardGrid>
      {hoverVariant ? (
        <div style={{ marginTop: '0.55rem', fontSize: '0.72rem', fontWeight: 600, color: '#CFE4F8' }}>
          Edit properties: double-click
        </div>
      ) : null}
    </MapInfoCard>
  );
};

const buildLeafEventHandlers = ({
  editable,
  leafNodeId,
  onRequestEdit,
}: {
  editable: boolean;
  leafNodeId: string;
  onRequestEdit: (leafId: string) => void;
}) => {
  const eventHandlers: L.LeafletEventHandlerFnMap = {
    dblclick: (event) => {
      const mouseEvent = event as L.LeafletMouseEvent;
      mouseEvent.originalEvent.preventDefault();
      mouseEvent.originalEvent.stopPropagation();
      onRequestEdit(leafNodeId);
    },
  };

  if (editable) {
    eventHandlers.add = (event) => {
      (event.target as LayerWithNodeId).__mapLeafNodeId = leafNodeId;
    };
  }

  return eventHandlers;
};

const LeafLayer = ({
  leafNode,
  editable,
  onRequestEdit,
}: {
  leafNode: MapLayerLeafNode;
  editable: boolean;
  onRequestEdit: (leafId: string) => void;
}) => {
  const color = getLeafColor(leafNode);

  const commonPathOptions = useMemo(
    () => ({
      color,
      weight: MAP_LINE_WEIGHT,
      dashArray: leafNode.shape === 'line' ? MAP_DASH_PATTERN : undefined,
      fillOpacity: leafNode.shape === 'polygon' || leafNode.shape === 'circle' ? 0.2 : undefined,
    }),
    [color, leafNode.shape]
  );

  const layerEventHandlers = useMemo(
    () =>
      buildLeafEventHandlers({
        editable,
        leafNodeId: leafNode.id,
        onRequestEdit,
      }),
    [editable, leafNode.id, onRequestEdit]
  );

  if (
    leafNode.shape === 'dot' &&
    Array.isArray(leafNode.coordinates) &&
    leafNode.coordinates.length === 2
  ) {
    return (
      <Marker
        position={toLatLng(leafNode.coordinates as [number, number])}
        icon={createDotIcon(color)}
        draggable={editable}
        eventHandlers={layerEventHandlers}
      >
        <Tooltip sticky direction="top" opacity={1}>
          <LeafInfoCard leafNode={leafNode} includeCoordinates={false} hoverVariant />
        </Tooltip>
      </Marker>
    );
  }

  if (leafNode.shape === 'line' && Array.isArray(leafNode.coordinates)) {
    return (
      <Polyline
        positions={toPathLatLngs(leafNode.coordinates as [number, number][])}
        pathOptions={commonPathOptions}
        eventHandlers={layerEventHandlers}
      >
        <Tooltip sticky direction="top" opacity={1}>
          <LeafInfoCard leafNode={leafNode} includeCoordinates={false} hoverVariant />
        </Tooltip>
      </Polyline>
    );
  }

  if (leafNode.shape === 'polygon' && Array.isArray(leafNode.coordinates)) {
    return (
      <Polygon
        positions={toPathLatLngs(leafNode.coordinates as [number, number][])}
        pathOptions={commonPathOptions}
        eventHandlers={layerEventHandlers}
      >
        <Tooltip sticky direction="top" opacity={1}>
          <LeafInfoCard leafNode={leafNode} includeCoordinates={false} hoverVariant />
        </Tooltip>
      </Polygon>
    );
  }

  if (
    leafNode.shape === 'circle' &&
    Array.isArray(leafNode.coordinates) &&
    leafNode.coordinates.length === 2
  ) {
    return (
      <Circle
        center={toLatLng(leafNode.coordinates as [number, number])}
        radius={leafNode.radiusMeters ?? 100}
        pathOptions={commonPathOptions}
        eventHandlers={layerEventHandlers}
      >
        <Tooltip sticky direction="top" opacity={1}>
          <LeafInfoCard leafNode={leafNode} includeCoordinates={false} hoverVariant />
        </Tooltip>
      </Circle>
    );
  }

  return null;
};

const EditableDrawControl = ({
  editableFeatureGroupRef,
  onCreate,
  onEdit,
  onDelete,
}: {
  editableFeatureGroupRef: RefObject<L.FeatureGroup | null>;
  onCreate: (draft: DrawShapeDraft) => void;
  onEdit: (edits: Array<{ leafId: string; draft: DrawShapeDraft }>) => void;
  onDelete: (leafIds: string[]) => void;
}) => {
  const map = useMap();
  const isEditModeRef = useRef(false);
  const isCtrlPressedRef = useRef(false);

  useEffect(() => {
    if (editableFeatureGroupRef.current == null) {
      return;
    }

    const applyCtrlEditState = () => {
      const featureGroup = editableFeatureGroupRef.current;
      if (featureGroup == null) {
        return;
      }

      const allowEditing = isEditModeRef.current && isCtrlPressedRef.current;
      featureGroup.eachLayer((layer) => {
        const maybePathLayer = layer as L.Layer & {
          editing?: {
            enable: () => void;
            disable: () => void;
          };
        };
        const maybeMarkerLayer = layer as L.Layer & {
          dragging?: {
            enable: () => void;
            disable: () => void;
          };
        };

        if (maybePathLayer.editing != null) {
          if (allowEditing) {
            maybePathLayer.editing.enable();
          } else {
            maybePathLayer.editing.disable();
          }
        }

        if (maybeMarkerLayer.dragging != null) {
          if (allowEditing) {
            maybeMarkerLayer.dragging.enable();
          } else {
            maybeMarkerLayer.dragging.disable();
          }
        }
      });
    };

    const drawControl = new L.Control.Draw({
      position: 'topright',
      edit: {
        featureGroup: editableFeatureGroupRef.current,
        edit: {},
        remove: true,
      },
      draw: {
        marker: {},
        rectangle: false,
        circlemarker: false,
        polygon: {},
        polyline: {},
        circle: {},
      },
    });

    const handleCreated = (event: L.DrawEvents.Created) => {
      const draft = extractGeometryFromDraftLayer({
        layerType: event.layerType,
        layer: event.layer as unknown as {
          getLatLngs?: () => unknown;
          getLatLng?: () => { lng: number; lat: number };
          getRadius?: () => number;
        },
      });
      editableFeatureGroupRef.current?.removeLayer(event.layer);
      if (draft == null) {
        return;
      }

      onCreate(draft);
    };

    const handleEdited = (event: L.DrawEvents.Edited) => {
      const editedDrafts: Array<{ leafId: string; draft: DrawShapeDraft }> = [];

      event.layers.eachLayer((layer) => {
        const typedLayer = layer as LayerWithNodeId;
        const leafId = typedLayer.__mapLeafNodeId;
        if (leafId == null || leafId === '') {
          return;
        }

        let layerType = '';
        if (layer instanceof L.Circle) {
          layerType = 'circle';
        } else if (layer instanceof L.Polygon) {
          layerType = 'polygon';
        } else if (layer instanceof L.Polyline) {
          layerType = 'polyline';
        } else if (layer instanceof L.Marker) {
          layerType = 'marker';
        }

        const draft = extractGeometryFromDraftLayer({
          layerType,
          layer: layer as unknown as {
            getLatLngs?: () => unknown;
            getLatLng?: () => { lng: number; lat: number };
            getRadius?: () => number;
          },
        });

        if (draft == null) {
          return;
        }

        editedDrafts.push({
          leafId,
          draft,
        });
      });

      if (editedDrafts.length > 0) {
        onEdit(editedDrafts);
      }
    };

    const handleDeleted = (event: L.DrawEvents.Deleted) => {
      const deletedLeafIds: string[] = [];

      event.layers.eachLayer((layer) => {
        const leafId = (layer as LayerWithNodeId).__mapLeafNodeId;
        if (leafId != null && leafId !== '') {
          deletedLeafIds.push(leafId);
        }
      });

      if (deletedLeafIds.length > 0) {
        onDelete(deletedLeafIds);
      }
    };
    const createdEventHandler: L.LeafletEventHandlerFn = (event) => {
      handleCreated(event as L.DrawEvents.Created);
    };
    const editedEventHandler: L.LeafletEventHandlerFn = (event) => {
      handleEdited(event as L.DrawEvents.Edited);
    };
    const deletedEventHandler: L.LeafletEventHandlerFn = (event) => {
      handleDeleted(event as L.DrawEvents.Deleted);
    };
    const editStartHandler: L.LeafletEventHandlerFn = () => {
      isEditModeRef.current = true;
      applyCtrlEditState();
    };
    const editStopHandler: L.LeafletEventHandlerFn = () => {
      isEditModeRef.current = false;
      applyCtrlEditState();
    };
    const handleKeyDown = (keyboardEvent: KeyboardEvent) => {
      if (keyboardEvent.key !== 'Control') {
        return;
      }
      isCtrlPressedRef.current = true;
      applyCtrlEditState();
    };
    const handleKeyUp = (keyboardEvent: KeyboardEvent) => {
      if (keyboardEvent.key !== 'Control') {
        return;
      }
      isCtrlPressedRef.current = false;
      applyCtrlEditState();
    };

    map.addControl(drawControl);
    map.on(L.Draw.Event.CREATED, createdEventHandler);
    map.on(L.Draw.Event.EDITED, editedEventHandler);
    map.on(L.Draw.Event.DELETED, deletedEventHandler);
    map.on(L.Draw.Event.EDITSTART, editStartHandler);
    map.on(L.Draw.Event.EDITSTOP, editStopHandler);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      map.off(L.Draw.Event.CREATED, createdEventHandler);
      map.off(L.Draw.Event.EDITED, editedEventHandler);
      map.off(L.Draw.Event.DELETED, deletedEventHandler);
      map.off(L.Draw.Event.EDITSTART, editStartHandler);
      map.off(L.Draw.Event.EDITSTOP, editStopHandler);
      map.removeControl(drawControl);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [editableFeatureGroupRef, map, onCreate, onDelete, onEdit]);

  return null;
};

export interface LeafletMapCanvasProps {
  visibleLeafNodes: MapLayerLeafNode[];
  onDrawCreate: (draft: DrawShapeDraft) => void;
  onDrawEdit: (edits: Array<{ leafId: string; draft: DrawShapeDraft }>) => void;
  onDrawDelete: (leafIds: string[]) => void;
  onRequestLeafEdit: (leafId: string) => void;
}

export const LeafletMapCanvas = ({
  visibleLeafNodes,
  onDrawCreate,
  onDrawEdit,
  onDrawDelete,
  onRequestLeafEdit,
}: LeafletMapCanvasProps) => {
  const editableFeatureGroupRef = useRef<L.FeatureGroup | null>(null);

  const editableLeafNodes = visibleLeafNodes.filter(
    (leafNode) => leafNode.source === 'user'
  );
  const staticLeafNodes = visibleLeafNodes.filter(
    (leafNode) => !(leafNode.source === 'user' && leafNode.shape !== 'dot')
  );

  return (
    <MapContainer
      center={[MAP_DEFAULT_CENTER_LAT, MAP_DEFAULT_CENTER_LNG]}
      zoom={MAP_DEFAULT_ZOOM}
      doubleClickZoom={false}
    >
      <TileLayer attribution={MAP_TILE_ATTRIBUTION} url={MAP_TILE_URL} />

      {staticLeafNodes.map((leafNode) => (
        <LeafLayer
          key={leafNode.id}
          leafNode={leafNode}
          editable={false}
          onRequestEdit={onRequestLeafEdit}
        />
      ))}

      <FeatureGroup ref={editableFeatureGroupRef}>
        {editableLeafNodes.map((leafNode) => (
          <LeafLayer
            key={leafNode.id}
            leafNode={leafNode}
            editable
            onRequestEdit={onRequestLeafEdit}
          />
        ))}
      </FeatureGroup>

      <EditableDrawControl
        editableFeatureGroupRef={editableFeatureGroupRef}
        onCreate={onDrawCreate}
        onEdit={onDrawEdit}
        onDelete={onDrawDelete}
      />
    </MapContainer>
  );
};
