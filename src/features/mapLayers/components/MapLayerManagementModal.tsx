import type { LayerSelectionOption } from '../hooks/useMapLayers';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useMemo, useState } from 'react';

import {
  SharedModal,
  SharedModalActionButton,
  SharedModalSection,
  SharedModalSectionLabel,
} from '../../../shared';

const ROOT_LAYER_VALUE = '';

const formatOptionLabel = (option: LayerSelectionOption) =>
  `${'\u00A0\u00A0'.repeat(option.depth)}${option.label}`;

export interface LayerManagementState {
  open: boolean;
  selectedLayerId: string;
  renameLayerName: string;
  moveParentLayerId: string;
  createParentLayerId: string;
  createLayerName: string;
  allowEdits: boolean;
}

export interface MapLayerManagementModalProps {
  state: LayerManagementState;
  options: LayerSelectionOption[];
  validationError: string | null;
  onClose: () => void;
  onChange: (nextState: LayerManagementState) => void;
  onCreateLayer: () => void;
  onRenameLayer: () => void;
  onMoveLayer: () => void;
  onToggleAllowEdits: () => void;
  onDeleteLayer: () => void;
}

export const MapLayerManagementModal = ({
  state,
  options,
  validationError,
  onClose,
  onChange,
  onCreateLayer,
  onRenameLayer,
  onMoveLayer,
  onToggleAllowEdits,
  onDeleteLayer,
}: MapLayerManagementModalProps) => {
  const [showCreator, setShowCreator] = useState(false);

  const selectedLayerLabel = useMemo(() => {
    const selectedOption = options.find((option) => option.nodeId === state.selectedLayerId);
    return selectedOption?.label ?? '(No layer selected)';
  }, [options, state.selectedLayerId]);

  const setField = <FieldKey extends keyof LayerManagementState>(
    key: FieldKey,
    value: LayerManagementState[FieldKey]
  ) => {
    onChange({
      ...state,
      [key]: value,
    });
  };

  return (
    <SharedModal
      open={state.open}
      onClose={onClose}
      title="Layer management"
      actions={
        <>
          <SharedModalActionButton variant="outlined" onClick={onClose}>
            Close
          </SharedModalActionButton>
        </>
      }
    >
      <Stack spacing={2.5} sx={{ minWidth: 360 }}>
        <SharedModalSection>
          <SharedModalSectionLabel>Selected layer</SharedModalSectionLabel>
          <TextField
            select
            fullWidth
            size="small"
            value={state.selectedLayerId}
            onChange={(event) => setField('selectedLayerId', event.target.value)}
          >
            {options.map((option) => (
              <MenuItem key={option.nodeId} value={option.nodeId}>
                {formatOptionLabel(option)}
              </MenuItem>
            ))}
          </TextField>
          <Typography variant="caption" sx={{ mt: 1, alignSelf: 'flex-start' }}>
            Current: {selectedLayerLabel}
          </Typography>
        </SharedModalSection>

        <SharedModalSection>
          <SharedModalSectionLabel>Create layer</SharedModalSectionLabel>
          <Button variant="outlined" size="small" onClick={() => setShowCreator((value) => !value)}>
            {showCreator ? 'Hide create layer' : 'Show create layer'}
          </Button>
          <Collapse in={showCreator} sx={{ width: '100%', mt: 1.5 }}>
            <Stack spacing={1.5}>
              <TextField
                select
                fullWidth
                size="small"
                label="Create under"
                value={state.createParentLayerId}
                onChange={(event) => setField('createParentLayerId', event.target.value)}
              >
                <MenuItem value={ROOT_LAYER_VALUE}>(Root/User root)</MenuItem>
                {options.map((option) => (
                  <MenuItem key={option.nodeId} value={option.nodeId}>
                    {formatOptionLabel(option)}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                fullWidth
                size="small"
                label="Layer name"
                value={state.createLayerName}
                onChange={(event) => setField('createLayerName', event.target.value)}
              />
              <Button variant="outlined" size="small" onClick={onCreateLayer}>
                Create
              </Button>
            </Stack>
          </Collapse>
        </SharedModalSection>

        <SharedModalSection>
          <SharedModalSectionLabel>Rename selected layer</SharedModalSectionLabel>
          <Stack spacing={1.5} sx={{ width: '100%' }}>
            <TextField
              fullWidth
              size="small"
              label="New layer name"
              value={state.renameLayerName}
              onChange={(event) => setField('renameLayerName', event.target.value)}
            />
            <Button variant="outlined" size="small" onClick={onRenameLayer}>
              Rename
            </Button>
          </Stack>
        </SharedModalSection>

        <SharedModalSection>
          <SharedModalSectionLabel>Move selected layer</SharedModalSectionLabel>
          <Stack spacing={1.5} sx={{ width: '100%' }}>
            <TextField
              select
              fullWidth
              size="small"
              label="Move under"
              value={state.moveParentLayerId}
              onChange={(event) => setField('moveParentLayerId', event.target.value)}
            >
              <MenuItem value={ROOT_LAYER_VALUE}>(Root/User root)</MenuItem>
              {options.map((option) => (
                <MenuItem key={option.nodeId} value={option.nodeId}>
                  {formatOptionLabel(option)}
                </MenuItem>
              ))}
            </TextField>
            <Button variant="outlined" size="small" onClick={onMoveLayer}>
              Move
            </Button>
          </Stack>
        </SharedModalSection>

        <SharedModalSection>
          <SharedModalSectionLabel>Layer permissions</SharedModalSectionLabel>
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{ alignSelf: 'flex-start' }}
          >
            <Switch
              checked={state.allowEdits}
              onChange={(event) => setField('allowEdits', event.target.checked)}
            />
            <Typography variant="body2">{state.allowEdits ? 'Editable' : 'Locked'}</Typography>
            <Button variant="outlined" size="small" onClick={onToggleAllowEdits}>
              Save
            </Button>
          </Stack>
        </SharedModalSection>

        <SharedModalSection>
          <SharedModalSectionLabel>Delete selected layer</SharedModalSectionLabel>
          <Button color="error" variant="outlined" size="small" onClick={onDeleteLayer}>
            Delete recursively
          </Button>
        </SharedModalSection>

        {validationError ? <Alert severity="error">{validationError}</Alert> : null}
      </Stack>
    </SharedModal>
  );
};
