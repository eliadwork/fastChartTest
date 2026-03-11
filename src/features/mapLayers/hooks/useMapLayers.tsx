import type { LegendTreeNode } from '../../../shared/legend';
import type {
  DrawShapeDraft,
  MapLayerGroupNode,
  MapLayerLeafNode,
  MapLayerNode,
  MapLeafCoordinates,
  RawMapLayerNode,
  ShapeDetailsFormValue,
} from '../types';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  MAP_EXPORT_FILE_NAME,
  MAP_MOCK_DATA_URL,
  MAP_SHAPE_MODAL_DEFAULT_COLOR,
} from '../mapLayersConstants';
import { MapShapeSymbol } from '../components/MapShapeSymbol';
import {
  addGroupUnderParent,
  addLeafToGroup,
  buildLayerTreeIndex,
  createDraftFromLeafNode,
  createLeafNodeFromDraft,
  deleteLeafNodes,
  ensureUserLayersRoot,
  getNodeVisibilityState,
  MAP_LAYERS_STORAGE_KEY,
  MAP_USER_LAYERS_ROOT_NAME,
  normalizeLayerTree,
  serializeLayerTree,
  updateLeafNode,
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
}: {
  node: MapLayerNode;
  depth: number;
}): LayerSelectionOption[] => {
  const options: LayerSelectionOption[] = [
    {
      nodeId: node.id,
      label: node.name,
      depth,
      kind: node.kind,
    },
  ];

  if (node.kind === 'group') {
    for (const childNode of node.children) {
      options.push(
        ...createLayerSelectionOptionsRecursive({
          node: childNode,
          depth: depth + 1,
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

const computeDefaultExistingLayerNodeId = ({
  rootNode,
}: {
  rootNode: MapLayerGroupNode;
}) => {
  const userLayersGroupNode = rootNode.children.find(
    (childNode) => childNode.kind === 'group' && childNode.name === MAP_USER_LAYERS_ROOT_NAME
  ) as MapLayerGroupNode | undefined;

  if (userLayersGroupNode != null) {
    return userLayersGroupNode.id;
  }

  return rootNode.id;
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
}): ShapeDetailsFormValue => {
  const defaultLayerNodeId = computeDefaultExistingLayerNodeId({ rootNode });

  return {
    ...DEFAULT_FORM_VALUE,
    shapeName: `${toShapeTitle(draft.shape)} ${new Date().toISOString()}`,
    shape: draft.shape,
    coordinatesText: toCoordinatesText(draft.coordinates),
    radiusMeters:
      draft.shape === 'circle'
        ? String(draft.radiusMeters ?? Number(DEFAULT_CIRCLE_RADIUS))
        : DEFAULT_CIRCLE_RADIUS,
    existingLayerNodeId: defaultLayerNodeId,
    newSubLayerParentNodeId: defaultLayerNodeId,
  };
};

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
  const [rootNode, setRootNode] = useState<MapLayerGroupNode | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [visibleLeafIds, setVisibleLeafIds] = useState<Set<string>>(new Set());
  const [shapeDetailsModalState, setShapeDetailsModalState] = useState<ShapeDetailsModalState>({
    open: false,
    mode: 'create',
    draft: null,
    editingLeafId: null,
    formValue: DEFAULT_FORM_VALUE,
  });

  const previousLeafIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    let isMounted = true;

    const loadMapLayerData = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const storedLayerDataText = localStorage.getItem(MAP_LAYERS_STORAGE_KEY);
        if (storedLayerDataText) {
          const parsedStoredLayerData = JSON.parse(storedLayerDataText) as RawMapLayerNode;
          const normalizedStoredRootNode = normalizeLayerTree({
            rawRootNode: parsedStoredLayerData,
            fallbackSource: 'mock',
          });
          const userRootResult = ensureUserLayersRoot({
            rootNode: normalizedStoredRootNode,
          });

          if (!isMounted) {
            return;
          }

          setRootNode(userRootResult.rootNode);
          setIsLoading(false);
          return;
        }

        const response = await fetch(MAP_MOCK_DATA_URL);
        if (!response.ok) {
          throw new Error(`Failed loading map mock data (${response.status})`);
        }

        const rawMockRootNode = (await response.json()) as RawMapLayerNode;
        const normalizedRootNode = normalizeLayerTree({
          rawRootNode: rawMockRootNode,
          fallbackSource: 'mock',
        });
        const userRootResult = ensureUserLayersRoot({
          rootNode: normalizedRootNode,
        });

        if (!isMounted) {
          return;
        }

        setRootNode(userRootResult.rootNode);
        setIsLoading(false);
      } catch (caughtError) {
        if (!isMounted) {
          return;
        }

        setErrorMessage(
          caughtError instanceof Error ? caughtError.message : 'Unknown map layer loading error.'
        );
        setIsLoading(false);
      }
    };

    void loadMapLayerData();

    return () => {
      isMounted = false;
    };
  }, []);

  const treeIndex = useMemo(() => {
    if (rootNode == null) {
      return null;
    }

    return buildLayerTreeIndex(rootNode);
  }, [rootNode]);

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

  useEffect(() => {
    if (rootNode == null) {
      return;
    }

    localStorage.setItem(MAP_LAYERS_STORAGE_KEY, JSON.stringify(serializeLayerTree(rootNode), null, 2));
  }, [rootNode]);

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

  const createLayerFromForm = useCallback(() => {
    if (rootNode == null || treeIndex == null) {
      return;
    }

    const parentGroupId = shapeDetailsModalState.formValue.newSubLayerParentNodeId.trim() === ''
      ? rootNode.id
      : resolveGroupNodeIdForSelection({
          selectedNodeId: shapeDetailsModalState.formValue.newSubLayerParentNodeId,
          currentRootNode: rootNode,
          currentIndex: treeIndex,
        });
    const layerName = shapeDetailsModalState.formValue.newLayerName.trim() || createDefaultLayerName();

    const createdLayerResult = addGroupUnderParent({
      rootNode,
      parentGroupId,
      groupName: layerName,
      source: 'user',
    });

    let nextRootNode = createdLayerResult.rootNode;
    let lastCreatedLayerId = createdLayerResult.newGroupId;

    const pathSegments = shapeDetailsModalState.formValue.newSubLayerPath
      .split(SUB_LAYER_PATH_DELIMITER)
      .map((segment) => segment.trim())
      .filter((segment) => segment !== '');

    for (const pathSegment of pathSegments) {
      const subLayerResult = addGroupUnderParent({
        rootNode: nextRootNode,
        parentGroupId: lastCreatedLayerId,
        groupName: pathSegment,
        source: 'user',
      });
      nextRootNode = subLayerResult.rootNode;
      lastCreatedLayerId = subLayerResult.newGroupId;
    }

    setRootNode(nextRootNode);
    setShapeDetailsModalState((previousState) => ({
      ...previousState,
      formValue: {
        ...previousState.formValue,
        existingLayerNodeId: lastCreatedLayerId,
        newSubLayerParentNodeId: lastCreatedLayerId,
        newLayerName: '',
        newSubLayerPath: '',
      },
    }));
  }, [rootNode, shapeDetailsModalState.formValue, treeIndex]);

  const resolveGroupTargetForCreate = useCallback(
    ({
      currentRootNode,
      currentIndex,
      formValue,
    }: {
      currentRootNode: MapLayerGroupNode;
      currentIndex: ReturnType<typeof buildLayerTreeIndex>;
      formValue: ShapeDetailsFormValue;
    }) => {
      if (formValue.existingLayerNodeId.trim() === '') {
        return {
          rootNode: currentRootNode,
          targetGroupId: currentRootNode.id,
        };
      }

      const groupNodeId = resolveGroupNodeIdForSelection({
        selectedNodeId: formValue.existingLayerNodeId,
        currentRootNode,
        currentIndex,
      });

      return {
        rootNode: currentRootNode,
        targetGroupId: groupNodeId,
      };
    },
    []
  );

  const submitShapeDetails = useCallback(() => {
    if (rootNode == null || treeIndex == null || shapeDetailsValidationError != null) {
      return;
    }

    const parsedGeometry = geometryParseResult.value;
    if (parsedGeometry == null) {
      return;
    }

    if (shapeDetailsModalState.mode === 'create') {
      const newLeafNode = createLeafNodeFromDraft({
        shape: parsedGeometry.shape,
        coordinates: parsedGeometry.coordinates,
        radiusMeters: parsedGeometry.radiusMeters,
        color: shapeDetailsModalState.formValue.color,
        notes: shapeDetailsModalState.formValue.notes,
        name: shapeDetailsModalState.formValue.shapeName.trim(),
      });

      const groupResolutionResult = resolveGroupTargetForCreate({
        currentRootNode: rootNode,
        currentIndex: treeIndex,
        formValue: shapeDetailsModalState.formValue,
      });

      const nextRootNode = addLeafToGroup({
        rootNode: groupResolutionResult.rootNode,
        targetGroupId: groupResolutionResult.targetGroupId,
        leafNode: newLeafNode,
      });

      setRootNode(nextRootNode);
      setVisibleLeafIds((previousVisibleLeafIds) => {
        const nextVisibleLeafIds = new Set(previousVisibleLeafIds);
        nextVisibleLeafIds.add(newLeafNode.id);
        return nextVisibleLeafIds;
      });
      closeShapeDetailsModal();
      return;
    }

    if (shapeDetailsModalState.editingLeafId == null) {
      return;
    }

    const currentLeafNode = treeIndex.nodeById.get(shapeDetailsModalState.editingLeafId);
    if (currentLeafNode == null || currentLeafNode.kind !== 'leaf') {
      return;
    }

    const nextLeafNode: MapLayerLeafNode = {
      ...currentLeafNode,
      name:
        shapeDetailsModalState.formValue.shapeName.trim() === ''
          ? currentLeafNode.name
          : shapeDetailsModalState.formValue.shapeName.trim(),
      shape: parsedGeometry.shape,
      coordinates: parsedGeometry.coordinates,
      radiusMeters: parsedGeometry.shape === 'circle' ? parsedGeometry.radiusMeters : undefined,
      color: shapeDetailsModalState.formValue.color,
      notes: shapeDetailsModalState.formValue.notes,
      metadata: {
        ...currentLeafNode.metadata,
        updatedAt: new Date().toISOString(),
      },
    };

    const currentParentGroupId =
      treeIndex.parentIdByNodeId.get(shapeDetailsModalState.editingLeafId) ?? rootNode.id;
    const targetGroupId =
      shapeDetailsModalState.formValue.existingLayerNodeId.trim() === ''
        ? rootNode.id
        : resolveGroupNodeIdForSelection({
            selectedNodeId: shapeDetailsModalState.formValue.existingLayerNodeId,
            currentRootNode: rootNode,
            currentIndex: treeIndex,
          });

    const nextRootNode =
      currentParentGroupId === targetGroupId
        ? updateLeafNode({
            rootNode,
            leafId: shapeDetailsModalState.editingLeafId,
            updater: () => nextLeafNode,
          })
        : addLeafToGroup({
            rootNode: deleteLeafNodes({
              rootNode,
              leafIdsToDelete: new Set([shapeDetailsModalState.editingLeafId]),
            }),
            targetGroupId,
            leafNode: nextLeafNode,
          });

    setRootNode(nextRootNode);
    closeShapeDetailsModal();
  }, [
    closeShapeDetailsModal,
    geometryParseResult.value,
    resolveGroupTargetForCreate,
    rootNode,
    shapeDetailsModalState,
    shapeDetailsValidationError,
    treeIndex,
  ]);

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

  const deleteShapes = useCallback((leafIds: string[]) => {
    if (leafIds.length === 0) {
      return;
    }

    setRootNode((previousRootNode) => {
      if (previousRootNode == null) {
        return previousRootNode;
      }

      return deleteLeafNodes({
        rootNode: previousRootNode,
        leafIdsToDelete: new Set(leafIds),
      });
    });

    setVisibleLeafIds((previousVisibleLeafIds) => {
      const nextVisibleLeafIds = new Set(previousVisibleLeafIds);
      for (const leafId of leafIds) {
        nextVisibleLeafIds.delete(leafId);
      }
      return nextVisibleLeafIds;
    });
  }, []);

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
    anchorElement.download = MAP_EXPORT_FILE_NAME;
    anchorElement.click();

    URL.revokeObjectURL(objectUrl);
  }, [rootNode]);

  const visibleLeafNodes = useMemo(() => {
    if (treeIndex == null) {
      return [] as MapLayerLeafNode[];
    }

    return treeIndex.leafNodes.filter((leafNode) => visibleLeafIds.has(leafNode.id));
  }, [treeIndex, visibleLeafIds]);

  return {
    rootNode,
    treeIndex,
    isLoading,
    errorMessage,
    legendNodes,
    layerSelectionOptions,
    visibleLeafIds,
    visibleLeafNodes,
    shapeDetailsModalState,
    shapeDetailsValidationError,
    handleLegendToggle,
    openCreateShapeDetailsModal,
    openShapePropertiesEditor,
    setShapeDetailsFormValue,
    createLayerFromForm,
    closeShapeDetailsModal,
    submitShapeDetails,
    updateEditedShapeGeometry,
    deleteShapes,
    exportTreeJson,
  };
};
