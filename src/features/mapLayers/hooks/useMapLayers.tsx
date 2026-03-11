import type { LegendTreeNode } from '../../../shared/legend';
import type { LayerManagementState } from '../components/MapLayerManagementModal';
import type {
  CopyNodeApiSnapshot,
  MapLayersApiSnapshot,
  ShapeGeometryPayload,
} from '../api/mapLayersApi';
import type {
  DrawShapeDraft,
  MapLayerGroupNode,
  MapLayerLeafNode,
  MapLayerNode,
  MapLeafCoordinates,
  ShapeDetailsFormValue,
} from '../types';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  copyNodeToUser,
  createLayer,
  createShape,
  deleteLayer,
  deleteShape,
  deleteShapes as deleteShapesBatch,
  fetchMapLayersSnapshot,
  updateLayer,
  updateShape,
} from '../api/mapLayersApi';
import { MAP_LAYERS_POLL_INTERVAL_MS, MAP_LAYERS_QUERY_KEY, MAP_SHAPE_MODAL_DEFAULT_COLOR } from '../mapLayersConstants';
import { MapShapeSymbol } from '../components/MapShapeSymbol';
import {
  buildLayerTreeIndex,
  createDraftFromLeafNode,
  getNodeVisibilityState,
  normalizeLayerTree,
  serializeLayerTree,
  updateSubtreeVisibility,
} from '../utils/mapLayerTreeUtils';

const SUB_LAYER_PATH_DELIMITER = '->';
const DEFAULT_CIRCLE_RADIUS = '100';
const MINIMUM_LINE_POINTS = 2;
const MINIMUM_POLYGON_POINTS = 3;

export interface LayerSelectionOption {
  nodeId: string;
  label: string;
  depth: number;
  kind: MapLayerNode['kind'];
}

export interface ShapeDetailsModalState {
  open: boolean;
  mode: 'create' | 'edit';
  draft: DrawShapeDraft | null;
  editingLeafId: string | null;
  formValue: ShapeDetailsFormValue;
}

interface ParsedGeometryResult {
  shape: ShapeDetailsFormValue['shape'];
  coordinates: MapLeafCoordinates;
  radiusMeters?: number;
}

const DEFAULT_FORM_VALUE: ShapeDetailsFormValue = {
  shapeName: '',
  shape: 'line',
  coordinatesText: '[]',
  radiusMeters: DEFAULT_CIRCLE_RADIUS,
  color: MAP_SHAPE_MODAL_DEFAULT_COLOR,
  notes: '',
  layerMode: 'existing',
  existingLayerNodeId: '',
  newLayerName: '',
  newSubLayerParentNodeId: '',
  newSubLayerPath: '',
};

const DEFAULT_LAYER_MANAGER_STATE: LayerManagementState = {
  open: false,
  selectedLayerId: '',
  renameLayerName: '',
  moveParentLayerId: '',
  createParentLayerId: '',
  createLayerName: '',
  allowEdits: true,
};

const createLegendNodeRecursive = ({
  node,
  visibleLeafIds,
}: {
  node: MapLayerNode;
  visibleLeafIds: Set<string>;
}): LegendTreeNode => {
  const visibilityState = getNodeVisibilityState({
    node,
    visibleLeafIds,
  });

  if (node.kind === 'leaf') {
    return {
      id: node.id,
      label: node.name,
      checked: visibilityState.checked,
      indeterminate: visibilityState.indeterminate,
      symbol: <MapShapeSymbol shape={node.shape} color={node.color} variant="legend" />,
    };
  }

  return {
    id: node.id,
    label: node.name,
    checked: visibilityState.checked,
    indeterminate: visibilityState.indeterminate,
    children: node.children.map((childNode) =>
      createLegendNodeRecursive({
        node: childNode,
        visibleLeafIds,
      })
    ),
  };
};

const createLayerSelectionOptionsRecursive = ({
  node,
  depth,
  includeLeaves,
}: {
  node: MapLayerNode;
  depth: number;
  includeLeaves: boolean;
}): LayerSelectionOption[] => {
  const options: LayerSelectionOption[] = [];
  if (includeLeaves || node.kind === 'group') {
    options.push({
      nodeId: node.id,
      label: node.name,
      depth,
      kind: node.kind,
    });
  }

  if (node.kind === 'group') {
    for (const childNode of node.children) {
      options.push(
        ...createLayerSelectionOptionsRecursive({
          node: childNode,
          depth: depth + 1,
          includeLeaves,
        })
      );
    }
  }

  return options;
};

const toShapeTitle = (shape: ShapeDetailsFormValue['shape']) =>
  shape.charAt(0).toUpperCase() + shape.slice(1);

const createDefaultLayerName = () => `Layer ${new Date().toISOString()}`;

const toCoordinatesText = (coordinates: DrawShapeDraft['coordinates']) =>
  JSON.stringify(coordinates, null, 2);

const toShapeGeometryPayload = ({
  shape,
  coordinates,
}: {
  shape: ShapeDetailsFormValue['shape'];
  coordinates: MapLeafCoordinates;
}): ShapeGeometryPayload => {
  if (shape === 'dot' || shape === 'circle') {
    const pointCoordinates = coordinates as [number, number];
    return {
      point: {
        lng: pointCoordinates[0],
        lat: pointCoordinates[1],
      },
    };
  }

  const pathCoordinates = coordinates as [number, number][];
  return {
    path: pathCoordinates.map((pointCoordinates) => ({
      lng: pointCoordinates[0],
      lat: pointCoordinates[1],
    })),
  };
};

const parseCoordinateTuple = (value: unknown): [number, number] | null => {
  if (!Array.isArray(value) || value.length < 2) {
    return null;
  }

  const longitude = value[0];
  const latitude = value[1];
  if (typeof longitude !== 'number' || !Number.isFinite(longitude)) {
    return null;
  }

  if (typeof latitude !== 'number' || !Number.isFinite(latitude)) {
    return null;
  }

  return [longitude, latitude];
};

const parseCoordinatePath = (value: unknown): [number, number][] | null => {
  if (!Array.isArray(value)) {
    return null;
  }

  const coordinatePath: [number, number][] = [];
  for (const pointValue of value) {
    const point = parseCoordinateTuple(pointValue);
    if (point == null) {
      return null;
    }
    coordinatePath.push(point);
  }

  return coordinatePath;
};

const parseGeometryFromForm = (formValue: ShapeDetailsFormValue): { value?: ParsedGeometryResult; error?: string } => {
  let parsedCoordinatesJson: unknown;

  try {
    parsedCoordinatesJson = JSON.parse(formValue.coordinatesText);
  } catch {
    return {
      error: 'Coordinates must be valid JSON.',
    };
  }

  if (formValue.shape === 'dot' || formValue.shape === 'circle') {
    const tupleCoordinates = parseCoordinateTuple(parsedCoordinatesJson);
    if (tupleCoordinates == null) {
      return {
        error: 'Dot/Circle coordinates must be [lng, lat].',
      };
    }

    if (formValue.shape === 'dot') {
      return {
        value: {
          shape: formValue.shape,
          coordinates: tupleCoordinates,
        },
      };
    }

    const radiusMeters = Number(formValue.radiusMeters);
    if (!Number.isFinite(radiusMeters) || radiusMeters <= 0) {
      return {
        error: 'Circle radius must be a positive number.',
      };
    }

    return {
      value: {
        shape: formValue.shape,
        coordinates: tupleCoordinates,
        radiusMeters,
      },
    };
  }

  const coordinatePath = parseCoordinatePath(parsedCoordinatesJson);
  if (coordinatePath == null) {
    return {
      error: `${toShapeTitle(formValue.shape)} coordinates must be [[lng,lat], ...].`,
    };
  }

  if (formValue.shape === 'line' && coordinatePath.length < MINIMUM_LINE_POINTS) {
    return {
      error: 'Line requires at least 2 coordinate points.',
    };
  }

  if (formValue.shape === 'polygon' && coordinatePath.length < MINIMUM_POLYGON_POINTS) {
    return {
      error: 'Polygon requires at least 3 coordinate points.',
    };
  }

  return {
    value: {
      shape: formValue.shape,
      coordinates: coordinatePath,
    },
  };
};

const getShapeDetailsValidationError = ({
  formValue,
  geometryError,
}: {
  formValue: ShapeDetailsFormValue;
  geometryError?: string;
}) => {
  if (formValue.color.trim() === '') {
    return 'Color is required.';
  }

  if (geometryError != null && geometryError !== '') {
    return geometryError;
  }

  return null;
};

const resolveGroupNodeIdForSelection = ({
  selectedNodeId,
  currentRootNode,
  currentIndex,
}: {
  selectedNodeId: string;
  currentRootNode: MapLayerGroupNode;
  currentIndex: ReturnType<typeof buildLayerTreeIndex>;
}) => {
  const selectedNode = currentIndex.nodeById.get(selectedNodeId);
  if (selectedNode == null) {
    return currentRootNode.id;
  }

  if (selectedNode.kind === 'group') {
    return selectedNode.id;
  }

  return currentIndex.parentIdByNodeId.get(selectedNode.id) ?? currentRootNode.id;
};

const createFormValueFromDraft = ({
  rootNode,
  draft,
}: {
  rootNode: MapLayerGroupNode;
  draft: DrawShapeDraft;
}): ShapeDetailsFormValue => ({
  ...DEFAULT_FORM_VALUE,
  shapeName: `${toShapeTitle(draft.shape)} ${new Date().toISOString()}`,
  shape: draft.shape,
  coordinatesText: toCoordinatesText(draft.coordinates),
  radiusMeters:
    draft.shape === 'circle'
      ? String(draft.radiusMeters ?? Number(DEFAULT_CIRCLE_RADIUS))
      : DEFAULT_CIRCLE_RADIUS,
  existingLayerNodeId: rootNode.id,
  newSubLayerParentNodeId: rootNode.id,
});

const createFormValueForEdit = ({
  leafNode,
  draft,
  currentParentGroupId,
}: {
  leafNode: MapLayerLeafNode;
  draft: DrawShapeDraft;
  currentParentGroupId: string;
}): ShapeDetailsFormValue => ({
  ...DEFAULT_FORM_VALUE,
  shapeName: leafNode.name,
  shape: draft.shape,
  coordinatesText: toCoordinatesText(draft.coordinates),
  radiusMeters:
    draft.shape === 'circle'
      ? String(draft.radiusMeters ?? leafNode.radiusMeters ?? Number(DEFAULT_CIRCLE_RADIUS))
      : DEFAULT_CIRCLE_RADIUS,
  color: leafNode.color ?? MAP_SHAPE_MODAL_DEFAULT_COLOR,
  notes: leafNode.notes ?? '',
  existingLayerNodeId: currentParentGroupId,
  newSubLayerParentNodeId: currentParentGroupId,
});

export const useMapLayers = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const [visibleLeafIds, setVisibleLeafIds] = useState<Set<string>>(new Set());
  const [mutationErrorMessage, setMutationErrorMessage] = useState<string | null>(null);
  const [layerManagementValidationError, setLayerManagementValidationError] = useState<string | null>(null);
  const [shapeDetailsModalState, setShapeDetailsModalState] = useState<ShapeDetailsModalState>({
    open: false,
    mode: 'create',
    draft: null,
    editingLeafId: null,
    formValue: DEFAULT_FORM_VALUE,
  });
  const [layerManagementState, setLayerManagementState] = useState<LayerManagementState>(
    DEFAULT_LAYER_MANAGER_STATE
  );

  const previousLeafIdsRef = useRef<Set<string>>(new Set());
  const previousRevisionRef = useRef<number | null>(null);
  const suppressRevisionNotificationRef = useRef(false);

  const snapshotQuery = useQuery({
    queryKey: MAP_LAYERS_QUERY_KEY,
    queryFn: fetchMapLayersSnapshot,
    refetchInterval: MAP_LAYERS_POLL_INTERVAL_MS,
  });

  const rootNode = useMemo(() => {
    if (snapshotQuery.data == null) {
      return null;
    }

    return normalizeLayerTree({
      rawRootNode: snapshotQuery.data.tree,
      fallbackSource: 'mock',
    });
  }, [snapshotQuery.data]);

  const treeIndex = useMemo(() => {
    if (rootNode == null) {
      return null;
    }

    return buildLayerTreeIndex(rootNode);
  }, [rootNode]);

  const applySnapshot = useCallback(
    ({
      snapshot,
      suppressNotification,
    }: {
      snapshot: MapLayersApiSnapshot;
      suppressNotification?: boolean;
    }) => {
      if (suppressNotification) {
        suppressRevisionNotificationRef.current = true;
      }

      queryClient.setQueryData(MAP_LAYERS_QUERY_KEY, snapshot);
    },
    [queryClient]
  );

  useEffect(() => {
    const snapshot = snapshotQuery.data;
    if (snapshot == null) {
      return;
    }

    const revisionChanged = previousRevisionRef.current != null && previousRevisionRef.current !== snapshot.revision;
    if (revisionChanged) {
      if (suppressRevisionNotificationRef.current) {
        suppressRevisionNotificationRef.current = false;
      } else {
        enqueueSnackbar('Layers were updated on the server.', {
          variant: 'info',
          autoHideDuration: 2500,
        });
      }
    }

    previousRevisionRef.current = snapshot.revision;
  }, [enqueueSnackbar, snapshotQuery.data]);

  useEffect(() => {
    if (treeIndex == null) {
      return;
    }

    setVisibleLeafIds((previousVisibleLeafIds) => {
      const nextVisibleLeafIds = new Set<string>();
      const currentLeafIds = new Set(treeIndex.leafNodes.map((leafNode) => leafNode.id));

      for (const leafNode of treeIndex.leafNodes) {
        const leafWasPreviouslyVisible = previousVisibleLeafIds.has(leafNode.id);
        const leafIsNew = !previousLeafIdsRef.current.has(leafNode.id);

        if (leafWasPreviouslyVisible || leafIsNew) {
          nextVisibleLeafIds.add(leafNode.id);
        }
      }

      previousLeafIdsRef.current = currentLeafIds;

      return nextVisibleLeafIds;
    });
  }, [treeIndex]);

  const legendNodes = useMemo(() => {
    if (rootNode == null) {
      return [] as LegendTreeNode[];
    }

    return rootNode.children.map((childNode) =>
      createLegendNodeRecursive({
        node: childNode,
        visibleLeafIds,
      })
    );
  }, [rootNode, visibleLeafIds]);

  const layerSelectionOptions = useMemo(() => {
    if (rootNode == null) {
      return [] as LayerSelectionOption[];
    }

    return rootNode.children.flatMap((childNode) =>
      createLayerSelectionOptionsRecursive({
        node: childNode,
        depth: 0,
        includeLeaves: true,
      })
    );
  }, [rootNode]);

  const groupSelectionOptions = useMemo(() => {
    if (rootNode == null) {
      return [] as LayerSelectionOption[];
    }

    return rootNode.children.flatMap((childNode) =>
      createLayerSelectionOptionsRecursive({
        node: childNode,
        depth: 0,
        includeLeaves: false,
      })
    );
  }, [rootNode]);

  const geometryParseResult = useMemo(
    () => parseGeometryFromForm(shapeDetailsModalState.formValue),
    [shapeDetailsModalState.formValue]
  );

  const shapeDetailsValidationError = useMemo(
    () =>
      getShapeDetailsValidationError({
        formValue: shapeDetailsModalState.formValue,
        geometryError: geometryParseResult.error,
      }),
    [geometryParseResult.error, shapeDetailsModalState.formValue]
  );

  const visibleLeafNodes = useMemo(() => {
    if (treeIndex == null) {
      return [] as MapLayerLeafNode[];
    }

    return treeIndex.leafNodes.filter((leafNode) => visibleLeafIds.has(leafNode.id));
  }, [treeIndex, visibleLeafIds]);

  const getLockedAncestorGroupId = useCallback(
    (nodeId: string) => {
      if (rootNode == null || treeIndex == null) {
        return null;
      }

      let currentNodeId: string | null = nodeId;
      while (currentNodeId != null) {
        const currentNode = treeIndex.nodeById.get(currentNodeId);
        if (currentNode == null) {
          return null;
        }

        if (
          currentNode.kind === 'group' &&
          currentNode.id !== rootNode.id &&
          currentNode.allowEdits === false
        ) {
          return currentNode.id;
        }

        currentNodeId = treeIndex.parentIdByNodeId.get(currentNodeId) ?? null;
      }

      return null;
    },
    [rootNode, treeIndex]
  );

  const assertNodeEditable = useCallback(
    ({
      nodeId,
      message,
    }: {
      nodeId: string;
      message: string;
    }) => {
      const lockedLayerId = getLockedAncestorGroupId(nodeId);
      if (lockedLayerId == null) {
        return true;
      }

      enqueueSnackbar(message, {
        variant: 'warning',
        autoHideDuration: 2800,
      });
      return false;
    },
    [enqueueSnackbar, getLockedAncestorGroupId]
  );

  const runMutation = useCallback(
    async ({
      mutation,
      successMessage,
    }: {
      mutation: () => Promise<MapLayersApiSnapshot>;
      successMessage?: string;
    }) => {
      setMutationErrorMessage(null);
      try {
        const nextSnapshot = await mutation();
        applySnapshot({
          snapshot: nextSnapshot,
          suppressNotification: true,
        });
        if (successMessage != null) {
          enqueueSnackbar(successMessage, {
            variant: 'success',
            autoHideDuration: 2200,
          });
        }
        return nextSnapshot;
      } catch (caughtError) {
        const nextErrorMessage =
          caughtError instanceof Error ? caughtError.message : 'Unknown map mutation error.';
        setMutationErrorMessage(nextErrorMessage);
        enqueueSnackbar(nextErrorMessage, {
          variant: 'error',
          autoHideDuration: 3000,
        });
        return null;
      }
    },
    [applySnapshot, enqueueSnackbar]
  );

  const createEditableCopyIfLocked = useCallback(
    async ({
      targetNodeId,
      promptMessage,
    }: {
      targetNodeId: string;
      promptMessage: string;
    }) => {
      const lockedLayerId = getLockedAncestorGroupId(targetNodeId);
      if (lockedLayerId == null) {
        return targetNodeId;
      }

      const shouldCreateCopy = window.confirm(promptMessage);
      if (!shouldCreateCopy) {
        return null;
      }

      const copySnapshot = await runMutation({
        mutation: () => copyNodeToUser(targetNodeId),
        successMessage: 'Created editable copy under User Layers.',
      });
      if (copySnapshot == null) {
        return null;
      }

      const typedCopySnapshot = copySnapshot as CopyNodeApiSnapshot;
      if (typedCopySnapshot.copiedNodeId == null || typedCopySnapshot.copiedNodeId === '') {
        return null;
      }

      return typedCopySnapshot.copiedNodeId;
    },
    [getLockedAncestorGroupId, runMutation]
  );

  const handleLegendToggle = useCallback(
    (nodeId: string, nextChecked: boolean) => {
      if (treeIndex == null) {
        return;
      }

      const node = treeIndex.nodeById.get(nodeId);
      if (node == null) {
        return;
      }

      setVisibleLeafIds((previousVisibleLeafIds) =>
        updateSubtreeVisibility({
          node,
          nextVisible: nextChecked,
          visibleLeafIds: previousVisibleLeafIds,
        })
      );
    },
    [treeIndex]
  );

  const openCreateShapeDetailsModal = useCallback(
    (draft: DrawShapeDraft) => {
      if (rootNode == null) {
        return;
      }

      setShapeDetailsModalState({
        open: true,
        mode: 'create',
        draft,
        editingLeafId: null,
        formValue: createFormValueFromDraft({
          rootNode,
          draft,
        }),
      });
    },
    [rootNode]
  );

  const openEditShapeDetailsModal = useCallback(
    ({
      leafId,
      draft,
    }: {
      leafId: string;
      draft: DrawShapeDraft;
    }) => {
      if (treeIndex == null) {
        return;
      }

      const node = treeIndex.nodeById.get(leafId);
      if (node == null || node.kind !== 'leaf') {
        return;
      }

      const currentParentGroupId = treeIndex.parentIdByNodeId.get(leafId) ?? '';

      setShapeDetailsModalState({
        open: true,
        mode: 'edit',
        draft,
        editingLeafId: leafId,
        formValue: createFormValueForEdit({
          leafNode: node,
          draft,
          currentParentGroupId,
        }),
      });
    },
    [treeIndex]
  );

  const openShapePropertiesEditor = useCallback(
    (leafId: string) => {
      if (treeIndex == null) {
        return;
      }

      const node = treeIndex.nodeById.get(leafId);
      if (node == null || node.kind !== 'leaf') {
        return;
      }

      openEditShapeDetailsModal({
        leafId,
        draft: createDraftFromLeafNode(node),
      });
    },
    [openEditShapeDetailsModal, treeIndex]
  );

  const closeShapeDetailsModal = useCallback(() => {
    setShapeDetailsModalState({
      open: false,
      mode: 'create',
      draft: null,
      editingLeafId: null,
      formValue: DEFAULT_FORM_VALUE,
    });
  }, []);

  const setShapeDetailsFormValue = useCallback((formValue: ShapeDetailsFormValue) => {
    setShapeDetailsModalState((previousState) => ({
      ...previousState,
      formValue,
    }));
  }, []);

  const createLayerFromForm = useCallback(async () => {
    if (rootNode == null || treeIndex == null) {
      return;
    }

    const parentGroupId =
      shapeDetailsModalState.formValue.newSubLayerParentNodeId.trim() === ''
        ? undefined
        : resolveGroupNodeIdForSelection({
            selectedNodeId: shapeDetailsModalState.formValue.newSubLayerParentNodeId,
            currentRootNode: rootNode,
            currentIndex: treeIndex,
          });
    const layerName =
      shapeDetailsModalState.formValue.newLayerName.trim() || createDefaultLayerName();

    if (
      parentGroupId != null &&
      !assertNodeEditable({
        nodeId: parentGroupId,
        message: 'Selected layer is locked. Cannot create a layer under it.',
      })
    ) {
      return;
    }

    const createdLayerSnapshot = await runMutation({
      mutation: () =>
        createLayer({
          parentGroupId,
          layerName,
        }),
      successMessage: 'Layer created.',
    });
    if (createdLayerSnapshot == null) {
      return;
    }

    let selectedLayerId = createdLayerSnapshot.updatedNodeId ?? '';
    const pathSegments = shapeDetailsModalState.formValue.newSubLayerPath
      .split(SUB_LAYER_PATH_DELIMITER)
      .map((segment) => segment.trim())
      .filter((segment) => segment !== '');

    for (const pathSegment of pathSegments) {
      const subLayerSnapshot = await runMutation({
        mutation: () =>
          createLayer({
            parentGroupId: selectedLayerId,
            layerName: pathSegment,
          }),
      });
      if (subLayerSnapshot == null) {
        break;
      }
      selectedLayerId = subLayerSnapshot.updatedNodeId ?? selectedLayerId;
    }

    if (selectedLayerId !== '') {
      setShapeDetailsModalState((previousState) => ({
        ...previousState,
        formValue: {
          ...previousState.formValue,
          existingLayerNodeId: selectedLayerId,
          newSubLayerParentNodeId: selectedLayerId,
          newLayerName: '',
          newSubLayerPath: '',
        },
      }));
    }
  }, [assertNodeEditable, rootNode, runMutation, shapeDetailsModalState.formValue, treeIndex]);

  const submitShapeDetails = useCallback(async () => {
    if (rootNode == null || treeIndex == null || shapeDetailsValidationError != null) {
      return;
    }

    const parsedGeometry = geometryParseResult.value;
    if (parsedGeometry == null) {
      return;
    }

    const selectedGroupId =
      shapeDetailsModalState.formValue.existingLayerNodeId.trim() === ''
        ? undefined
        : resolveGroupNodeIdForSelection({
            selectedNodeId: shapeDetailsModalState.formValue.existingLayerNodeId,
            currentRootNode: rootNode,
            currentIndex: treeIndex,
          });

    if (shapeDetailsModalState.mode === 'create') {
      if (
        selectedGroupId != null &&
        !assertNodeEditable({
          nodeId: selectedGroupId,
          message: 'Selected layer is locked. Cannot add a shape to it.',
        })
      ) {
        return;
      }

      const createdSnapshot = await runMutation({
        mutation: () =>
          createShape({
            targetGroupId: selectedGroupId,
            shape: parsedGeometry.shape,
            geometry: toShapeGeometryPayload({
              shape: parsedGeometry.shape,
              coordinates: parsedGeometry.coordinates,
            }),
            radiusMeters: parsedGeometry.radiusMeters,
            color: shapeDetailsModalState.formValue.color,
            notes: shapeDetailsModalState.formValue.notes,
            name: shapeDetailsModalState.formValue.shapeName.trim(),
          }),
        successMessage: 'Shape created.',
      });
      if (createdSnapshot != null) {
        closeShapeDetailsModal();
      }
      return;
    }

    if (shapeDetailsModalState.editingLeafId == null) {
      return;
    }

    const editableShapeId = await createEditableCopyIfLocked({
      targetNodeId: shapeDetailsModalState.editingLeafId,
      promptMessage:
        'This layer is locked. Do you want to create an editable copy under User Layers and apply your edit there?',
    });
    if (editableShapeId == null) {
      return;
    }

    const updatedSnapshot = await runMutation({
      mutation: () =>
        updateShape({
          shapeId: editableShapeId,
          payload: {
            targetGroupId: selectedGroupId,
            name: shapeDetailsModalState.formValue.shapeName.trim(),
            geometry: toShapeGeometryPayload({
              shape: parsedGeometry.shape,
              coordinates: parsedGeometry.coordinates,
            }),
            radiusMeters: parsedGeometry.shape === 'circle' ? parsedGeometry.radiusMeters : undefined,
            color: shapeDetailsModalState.formValue.color,
            notes: shapeDetailsModalState.formValue.notes,
          },
        }),
      successMessage: 'Shape updated.',
    });

    if (updatedSnapshot != null) {
      closeShapeDetailsModal();
    }
  }, [
    assertNodeEditable,
    closeShapeDetailsModal,
    createEditableCopyIfLocked,
    geometryParseResult.value,
    rootNode,
    runMutation,
    shapeDetailsModalState,
    shapeDetailsValidationError,
    treeIndex,
  ]);

  const deleteEditedShape = useCallback(async () => {
    if (shapeDetailsModalState.editingLeafId == null) {
      return;
    }

    const shouldDelete = window.confirm('Delete this shape?');
    if (!shouldDelete) {
      return;
    }

    const deletedSnapshot = await runMutation({
      mutation: () => deleteShape(shapeDetailsModalState.editingLeafId as string),
      successMessage: 'Shape deleted.',
    });
    if (deletedSnapshot != null) {
      closeShapeDetailsModal();
    }
  }, [closeShapeDetailsModal, runMutation, shapeDetailsModalState.editingLeafId]);

  const updateEditedShapeGeometry = useCallback(
    ({
      leafId,
      draft,
    }: {
      leafId: string;
      draft: DrawShapeDraft;
    }) => {
      openEditShapeDetailsModal({
        leafId,
        draft,
      });
    },
    [openEditShapeDetailsModal]
  );

  const deleteShapes = useCallback(
    async (leafIds: string[]) => {
      if (leafIds.length === 0) {
        return;
      }

      await runMutation({
        mutation: () => deleteShapesBatch(leafIds),
        successMessage: 'Shapes deleted.',
      });
    },
    [runMutation]
  );

  const exportTreeJson = useCallback(() => {
    if (rootNode == null) {
      return;
    }

    const rawTree = serializeLayerTree(rootNode);
    const serializedTree = JSON.stringify(rawTree, null, 2);
    const blob = new Blob([serializedTree], { type: 'application/json' });
    const objectUrl = URL.createObjectURL(blob);

    const anchorElement = document.createElement('a');
    anchorElement.href = objectUrl;
    anchorElement.download = 'bus-stops-map-layers.json';
    anchorElement.click();

    URL.revokeObjectURL(objectUrl);
  }, [rootNode]);

  const refreshLayers = useCallback(async () => {
    suppressRevisionNotificationRef.current = false;
    await snapshotQuery.refetch();
  }, [snapshotQuery]);

  const openLayerManagementModal = useCallback(
    (clickedNodeId: string) => {
      if (rootNode == null || treeIndex == null) {
        return;
      }

      const clickedNode = treeIndex.nodeById.get(clickedNodeId);
      const selectedLayerId =
        clickedNode != null && clickedNode.kind === 'group'
          ? clickedNode.id
          : treeIndex.parentIdByNodeId.get(clickedNodeId) ?? groupSelectionOptions[0]?.nodeId ?? '';

      const selectedLayerNode = treeIndex.nodeById.get(selectedLayerId);
      const isGroup = selectedLayerNode != null && selectedLayerNode.kind === 'group';

      setLayerManagementState({
        open: true,
        selectedLayerId,
        renameLayerName: isGroup ? selectedLayerNode.name : '',
        moveParentLayerId: '',
        createParentLayerId: selectedLayerId,
        createLayerName: '',
        allowEdits: isGroup ? selectedLayerNode.allowEdits : true,
      });
      setLayerManagementValidationError(null);
    },
    [groupSelectionOptions, rootNode, treeIndex]
  );

  const closeLayerManagementModal = useCallback(() => {
    setLayerManagementState(DEFAULT_LAYER_MANAGER_STATE);
    setLayerManagementValidationError(null);
  }, []);

  const setLayerManagementFormState = useCallback(
    (nextState: LayerManagementState) => {
      if (treeIndex == null) {
        setLayerManagementState(nextState);
        setLayerManagementValidationError(null);
        return;
      }

      const selectedChanged = nextState.selectedLayerId !== layerManagementState.selectedLayerId;
      const selectedNode = treeIndex.nodeById.get(nextState.selectedLayerId);
      if (selectedChanged && selectedNode != null && selectedNode.kind === 'group') {
        setLayerManagementState({
          ...nextState,
          renameLayerName: selectedNode.name,
          allowEdits: selectedNode.allowEdits,
        });
      } else {
        setLayerManagementState(nextState);
      }
      setLayerManagementValidationError(null);
    },
    [layerManagementState.selectedLayerId, treeIndex]
  );

  const createLayerFromManager = useCallback(async () => {
    if (
      layerManagementState.createParentLayerId.trim() !== '' &&
      !assertNodeEditable({
        nodeId: layerManagementState.createParentLayerId,
        message: 'Selected layer is locked. Cannot create a layer under it.',
      })
    ) {
      return;
    }

    const createdSnapshot = await runMutation({
      mutation: () =>
        createLayer({
          parentGroupId:
            layerManagementState.createParentLayerId.trim() === ''
              ? undefined
              : layerManagementState.createParentLayerId,
          layerName: layerManagementState.createLayerName.trim() || undefined,
        }),
      successMessage: 'Layer created.',
    });

    if (createdSnapshot?.updatedNodeId) {
      setLayerManagementState((previousState) => ({
        ...previousState,
        selectedLayerId: createdSnapshot.updatedNodeId ?? previousState.selectedLayerId,
        createLayerName: '',
      }));
    }
  }, [
    assertNodeEditable,
    layerManagementState.createLayerName,
    layerManagementState.createParentLayerId,
    runMutation,
  ]);

  const renameManagedLayer = useCallback(async () => {
    if (layerManagementState.selectedLayerId.trim() === '') {
      return;
    }

    if (
      !assertNodeEditable({
        nodeId: layerManagementState.selectedLayerId,
        message: 'Selected layer is locked. Cannot rename it.',
      })
    ) {
      return;
    }

    await runMutation({
      mutation: () =>
        updateLayer({
          layerId: layerManagementState.selectedLayerId,
          payload: {
            layerName: layerManagementState.renameLayerName,
          },
        }),
      successMessage: 'Layer renamed.',
    });
  }, [assertNodeEditable, layerManagementState.renameLayerName, layerManagementState.selectedLayerId, runMutation]);

  const moveManagedLayer = useCallback(async () => {
    if (layerManagementState.selectedLayerId.trim() === '') {
      return;
    }
    if (treeIndex == null) {
      return;
    }

    if (layerManagementState.moveParentLayerId === layerManagementState.selectedLayerId) {
      setLayerManagementValidationError('Layer cannot be moved under itself.');
      return;
    }

    const nextParentId = layerManagementState.moveParentLayerId.trim();
    if (nextParentId !== '') {
      let currentNodeId: string | null = nextParentId;
      while (currentNodeId != null) {
        if (currentNodeId === layerManagementState.selectedLayerId) {
          setLayerManagementValidationError('Layer cannot be moved under its descendant.');
          return;
        }
        currentNodeId = treeIndex.parentIdByNodeId.get(currentNodeId) ?? null;
      }
    }

    const editableLayerId = await createEditableCopyIfLocked({
      targetNodeId: layerManagementState.selectedLayerId,
      promptMessage:
        'This layer is locked. Do you want to create an editable copy under User Layers and move that copy?',
    });
    if (editableLayerId == null) {
      return;
    }

    await runMutation({
      mutation: () =>
        updateLayer({
          layerId: editableLayerId,
          payload: {
            parentGroupId: nextParentId === '' ? null : nextParentId,
          },
        }),
      successMessage: 'Layer moved.',
    });
  }, [
    createEditableCopyIfLocked,
    layerManagementState.moveParentLayerId,
    layerManagementState.selectedLayerId,
    runMutation,
    treeIndex,
  ]);

  const toggleManagedLayerAllowEdits = useCallback(async () => {
    if (layerManagementState.selectedLayerId.trim() === '') {
      return;
    }

    await runMutation({
      mutation: () =>
        updateLayer({
          layerId: layerManagementState.selectedLayerId,
          payload: {
            allowEdits: layerManagementState.allowEdits,
          },
        }),
      successMessage: 'Layer permissions updated.',
    });
  }, [layerManagementState.allowEdits, layerManagementState.selectedLayerId, runMutation]);

  const deleteManagedLayer = useCallback(async () => {
    if (layerManagementState.selectedLayerId.trim() === '') {
      return;
    }

    if (
      !assertNodeEditable({
        nodeId: layerManagementState.selectedLayerId,
        message: 'Selected layer is locked. Cannot delete it.',
      })
    ) {
      return;
    }

    const shouldDelete = window.confirm('Delete this layer recursively?');
    if (!shouldDelete) {
      return;
    }

    const deletedSnapshot = await runMutation({
      mutation: () => deleteLayer(layerManagementState.selectedLayerId),
      successMessage: 'Layer deleted.',
    });
    if (deletedSnapshot != null) {
      setLayerManagementState((previousState) => ({
        ...previousState,
        selectedLayerId: groupSelectionOptions[0]?.nodeId ?? '',
      }));
    }
  }, [assertNodeEditable, groupSelectionOptions, layerManagementState.selectedLayerId, runMutation]);

  const errorMessage = useMemo(() => {
    if (mutationErrorMessage != null) {
      return mutationErrorMessage;
    }

    if (snapshotQuery.error instanceof Error) {
      return snapshotQuery.error.message;
    }

    return null;
  }, [mutationErrorMessage, snapshotQuery.error]);

  return {
    rootNode,
    treeIndex,
    isLoading: snapshotQuery.isLoading,
    isRefreshing: snapshotQuery.isFetching,
    errorMessage,
    legendNodes,
    layerSelectionOptions,
    groupSelectionOptions,
    visibleLeafIds,
    visibleLeafNodes,
    shapeDetailsModalState,
    shapeDetailsValidationError,
    layerManagementState,
    layerManagementValidationError,
    handleLegendToggle,
    openLayerManagementModal,
    closeLayerManagementModal,
    setLayerManagementFormState,
    createLayerFromManager,
    renameManagedLayer,
    moveManagedLayer,
    toggleManagedLayerAllowEdits,
    deleteManagedLayer,
    openCreateShapeDetailsModal,
    openShapePropertiesEditor,
    setShapeDetailsFormValue,
    createLayerFromForm,
    closeShapeDetailsModal,
    submitShapeDetails,
    deleteEditedShape,
    updateEditedShapeGeometry,
    deleteShapes,
    exportTreeJson,
    refreshLayers,
  };
};
