import type { LayerSelectionOption, ShapeDetailsModalState } from '../hooks/useMapLayers';
import type { ShapeDetailsFormValue } from '../types';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useState } from 'react';

import {
  SharedModal,
  SharedModalActionButton,
  SharedModalSection,
  SharedModalSectionLabel,
} from '../../../shared';

const ROOT_LAYER_VALUE = '';

const getOptionLabel = (option: LayerSelectionOption) =>
  `${'\u00A0\u00A0'.repeat(option.depth)}${option.label}`;

export interface MapShapeDetailsModalProps {
  state: ShapeDetailsModalState;
  layerSelectionOptions: LayerSelectionOption[];
  validationError: string | null;
  onChange: (nextFormValue: ShapeDetailsFormValue) => void;
  onCreateLayer: () => void;
  onCancel: () => void;
  onSave: () => void;
  onDelete?: () => void;
}

export const MapShapeDetailsModal = ({
  state,
  layerSelectionOptions,
  validationError,
  onChange,
  onCreateLayer,
  onCancel,
  onSave,
  onDelete,
}: MapShapeDetailsModalProps) => {
  const { formValue, mode } = state;
  const [showCoordinates, setShowCoordinates] = useState(false);
  const [showLayerCreator, setShowLayerCreator] = useState(false);

  const onFormValueChange = <FieldKey extends keyof ShapeDetailsFormValue>(
    fieldKey: FieldKey,
    fieldValue: ShapeDetailsFormValue[FieldKey]
  ) => {
    onChange({
      ...formValue,
      [fieldKey]: fieldValue,
    });
  };

  return (
    <SharedModal
      open={state.open}
      onClose={onCancel}
      title={mode === 'create' ? 'Save shape details' : 'Edit shape details'}
      actions={
        <>
          <SharedModalActionButton variant="outlined" onClick={onCancel}>
            Cancel
          </SharedModalActionButton>
          {mode === 'edit' && onDelete ? (
            <SharedModalActionButton
              variant="outlined"
              color="error"
              startIcon={<DeleteOutlineIcon />}
              onClick={onDelete}
            >
              Delete
            </SharedModalActionButton>
          ) : null}
          <SharedModalActionButton
            variant="contained"
            onClick={onSave}
            disabled={validationError != null}
          >
            Save
          </SharedModalActionButton>
        </>
      }
    >
      <Stack spacing={2.5} sx={{ minWidth: 340 }}>
        <SharedModalSection>
          <SharedModalSectionLabel>Shape name</SharedModalSectionLabel>
          <TextField
            fullWidth
            size="small"
            value={formValue.shapeName}
            onChange={(event) => onFormValueChange('shapeName', event.target.value)}
            placeholder="Leave empty for default name"
          />
        </SharedModalSection>

        <SharedModalSection>
          <SharedModalSectionLabel>Shape type</SharedModalSectionLabel>
          <TextField
            fullWidth
            size="small"
            value={formValue.shape}
            slotProps={{ input: { readOnly: true } }}
          />
        </SharedModalSection>

        <SharedModalSection>
          <SharedModalSectionLabel>Layer for this shape</SharedModalSectionLabel>
          <TextField
            select
            fullWidth
            size="small"
            label="Target layer"
            value={formValue.existingLayerNodeId}
            onChange={(event) => onFormValueChange('existingLayerNodeId', event.target.value)}
          >
            <MenuItem value={ROOT_LAYER_VALUE}>(Root)</MenuItem>
            {layerSelectionOptions.map((option) => (
              <MenuItem key={option.nodeId} value={option.nodeId}>
                {getOptionLabel(option)}
              </MenuItem>
            ))}
          </TextField>
        </SharedModalSection>

        <SharedModalSection>
          <SharedModalSectionLabel>Layer creator</SharedModalSectionLabel>
          <Button variant="outlined" size="small" onClick={() => setShowLayerCreator((value) => !value)}>
            {showLayerCreator ? 'Hide layer creator' : 'Show layer creator'}
          </Button>
          <Collapse in={showLayerCreator} sx={{ width: '100%', mt: 1.5 }}>
            <Stack spacing={1.5} sx={{ width: '100%' }}>
              <TextField
                select
                fullWidth
                size="small"
                label="Create under"
                value={formValue.newSubLayerParentNodeId}
                onChange={(event) => onFormValueChange('newSubLayerParentNodeId', event.target.value)}
                helperText="Empty = root. Select a layer to create under it."
              >
                <MenuItem value={ROOT_LAYER_VALUE}>(Root)</MenuItem>
                {layerSelectionOptions.map((option) => (
                  <MenuItem key={option.nodeId} value={option.nodeId}>
                    {getOptionLabel(option)}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                fullWidth
                size="small"
                label="New layer name"
                value={formValue.newLayerName}
                onChange={(event) => onFormValueChange('newLayerName', event.target.value)}
                placeholder="Leave empty for default name"
              />
              <TextField
                fullWidth
                size="small"
                label="Sublayer path"
                value={formValue.newSubLayerPath}
                onChange={(event) => onFormValueChange('newSubLayerPath', event.target.value)}
                placeholder="today -> night"
                helperText="Optional nested path under the new layer."
              />
              <Button variant="outlined" size="small" onClick={onCreateLayer}>
                Create
              </Button>
            </Stack>
          </Collapse>
        </SharedModalSection>

        <SharedModalSection>
          <SharedModalSectionLabel>Color</SharedModalSectionLabel>
          <TextField
            size="small"
            type="color"
            value={formValue.color}
            onChange={(event) => onFormValueChange('color', event.target.value)}
            sx={{ width: 120 }}
          />
        </SharedModalSection>

        <SharedModalSection>
          <SharedModalSectionLabel>Notes</SharedModalSectionLabel>
          <TextField
            size="small"
            multiline
            minRows={3}
            value={formValue.notes}
            onChange={(event) => onFormValueChange('notes', event.target.value)}
            placeholder="Optional notes"
            fullWidth
          />
        </SharedModalSection>

        <SharedModalSection>
          <SharedModalSectionLabel>Location</SharedModalSectionLabel>
          <Button variant="outlined" size="small" onClick={() => setShowCoordinates((value) => !value)}>
            {showCoordinates ? 'Hide coordinates' : 'Show coordinates'}
          </Button>
          <Collapse in={showCoordinates} sx={{ width: '100%', mt: 1.5 }}>
            <TextField
              size="small"
              multiline
              minRows={5}
              value={formValue.coordinatesText}
              onChange={(event) => onFormValueChange('coordinatesText', event.target.value)}
              fullWidth
              label="Coordinates (JSON)"
              sx={{
                '& .MuiInputBase-inputMultiline': {
                  maxHeight: 220,
                  overflowY: 'auto',
                  fontFamily: 'monospace',
                  fontSize: '0.78rem',
                },
              }}
            />
          </Collapse>
          {formValue.shape === 'circle' ? (
            <TextField
              sx={{ mt: 1.5 }}
              size="small"
              type="number"
              value={formValue.radiusMeters}
              onChange={(event) => onFormValueChange('radiusMeters', event.target.value)}
              inputProps={{ min: 1 }}
              fullWidth
              label="Radius (meters)"
            />
          ) : null}
        </SharedModalSection>

        {validationError ? <Alert severity="error">{validationError}</Alert> : null}
      </Stack>
    </SharedModal>
  );
};
