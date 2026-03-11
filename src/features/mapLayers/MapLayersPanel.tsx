import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';

import { MapLayerLegend } from './components/MapLayerLegend';
import { LeafletMapCanvas } from './components/LeafletMapCanvas';
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
    errorMessage,
    legendNodes,
    layerSelectionOptions,
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
  } = useMapLayers();

  return (
    <MapLayersPane>
      <MapLayersHeader>
        <MapLayersTitle>Bus Stops Map</MapLayersTitle>
        <MapLayersHeaderActions>
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

        <MapLayerLegend nodes={legendNodes} onToggle={handleLegendToggle} />
      </MapLayersMapArea>

      <MapShapeDetailsModal
        state={shapeDetailsModalState}
        layerSelectionOptions={layerSelectionOptions}
        validationError={shapeDetailsValidationError}
        onChange={setShapeDetailsFormValue}
        onCreateLayer={createLayerFromForm}
        onCancel={closeShapeDetailsModal}
        onSave={submitShapeDetails}
      />
    </MapLayersPane>
  );
};
