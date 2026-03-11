import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import RefreshIcon from '@mui/icons-material/Refresh';

import { MapLayerLegend } from './components/MapLayerLegend';
import { LeafletMapCanvas } from './components/LeafletMapCanvas';
import { MapLayerManagementModal } from './components/MapLayerManagementModal';
import { MapShapeDetailsModal } from './components/MapShapeDetailsModal';
import { useMapLayers } from './hooks/useMapLayers';
import {
  MapLayersHeader,
  MapLayersHeaderActions,
  MapLayersHeaderButton,
  MapLayersMapArea,
  MapLayersPane,
  MapLayersTitle,
} from './MapLayersStyled';

export const MapLayersPanel = () => {
  const {
    isLoading,
    isRefreshing,
    errorMessage,
    legendNodes,
    layerSelectionOptions,
    groupSelectionOptions,
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
  } = useMapLayers();

  return (
    <MapLayersPane>
      <MapLayersHeader>
        <MapLayersTitle>Bus Stops Map</MapLayersTitle>
        <MapLayersHeaderActions>
          <MapLayersHeaderButton
            variant="outlined"
            onClick={() => {
              void refreshLayers();
            }}
            startIcon={<RefreshIcon fontSize="small" />}
            disabled={isRefreshing}
          >
            Refresh
          </MapLayersHeaderButton>
          <MapLayersHeaderButton variant="outlined" onClick={exportTreeJson}>
            Export JSON
          </MapLayersHeaderButton>
        </MapLayersHeaderActions>
      </MapLayersHeader>

      <MapLayersMapArea>
        {isLoading ? (
          <CircularProgress size={24} sx={{ position: 'absolute', top: 12, right: 12, zIndex: 1000 }} />
        ) : null}

        {errorMessage ? (
          <Alert severity="error" sx={{ position: 'absolute', top: 12, left: 12, right: 12, zIndex: 1000 }}>
            {errorMessage}
          </Alert>
        ) : null}

        <LeafletMapCanvas
          visibleLeafNodes={visibleLeafNodes}
          onDrawCreate={openCreateShapeDetailsModal}
          onDrawEdit={(editedDrafts) => {
            const firstEditedDraft = editedDrafts[0];
            if (!firstEditedDraft) {
              return;
            }

            updateEditedShapeGeometry({
              leafId: firstEditedDraft.leafId,
              draft: firstEditedDraft.draft,
            });
          }}
          onDrawDelete={deleteShapes}
          onRequestLeafEdit={openShapePropertiesEditor}
        />

        <MapLayerLegend
          nodes={legendNodes}
          onToggle={handleLegendToggle}
          onNodeDoubleClick={openLayerManagementModal}
        />
      </MapLayersMapArea>

      <MapShapeDetailsModal
        state={shapeDetailsModalState}
        layerSelectionOptions={layerSelectionOptions}
        validationError={shapeDetailsValidationError}
        onChange={setShapeDetailsFormValue}
        onCreateLayer={createLayerFromForm}
        onCancel={closeShapeDetailsModal}
        onSave={submitShapeDetails}
        onDelete={() => {
          void deleteEditedShape();
        }}
      />

      <MapLayerManagementModal
        state={layerManagementState}
        options={groupSelectionOptions}
        validationError={layerManagementValidationError}
        onClose={closeLayerManagementModal}
        onChange={setLayerManagementFormState}
        onCreateLayer={() => {
          void createLayerFromManager();
        }}
        onRenameLayer={() => {
          void renameManagedLayer();
        }}
        onMoveLayer={() => {
          void moveManagedLayer();
        }}
        onToggleAllowEdits={() => {
          void toggleManagedLayerAllowEdits();
        }}
        onDeleteLayer={() => {
          void deleteManagedLayer();
        }}
      />
    </MapLayersPane>
  );
};
