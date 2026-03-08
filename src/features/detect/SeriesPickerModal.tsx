import type { PointMarkColor } from '../../store/pointMarkStore';

import InputLabel from '@mui/material/InputLabel';

import {
  PointMarkModalButton,
  PointMarkModalButtons,
  PointMarkModalCancel,
  PointMarkModalOverlay,
  PointMarkModalSection,
  PointMarkModalSectionLabel,
  PointMarkModalTitle,
} from '../../styled/ChartStyled';
import { DETECT_COLOR_HEX_BY_NAME } from './detectConstants';
import {
  SERIES_PICKER_BUTTON_SAVE,
  SERIES_PICKER_BUTTON_START_OVER,
  SERIES_PICKER_BUTTON_UNDO,
  SERIES_PICKER_SECTION_COLOR,
  SERIES_PICKER_SECTION_DATA_SERIES,
  SERIES_PICKER_SELECT_LABEL,
  SERIES_PICKER_MODAL_TITLE,
} from './seriesPickerModalConstants';
import {
  DetectColorSwatch,
  DetectColorSwatches,
  DetectModalContent,
  DetectSeriesFormControl,
  DetectSeriesSelect,
} from './DetectStyled';

export interface SeriesPickerModalProps {
  open: boolean;
  colorOptions: PointMarkColor[];
  selectedColor?: PointMarkColor;
  seriesOptions: number[];
  seriesNames: string[];
  selectedSeriesIndex: number;
  canConfirm: boolean;
  onColorChange: (color: PointMarkColor) => void;
  onSeriesChange: (seriesIndex: number) => void;
  onDone: () => void;
  /** Undo the last click (back to 2 clicks). */
  onUndoLastClick: () => void;
  /** Cancel the entire 3-click flow and start over. */
  onCancelFlow: () => void;
}

export const SeriesPickerModal = ({
  open,
  colorOptions,
  selectedColor,
  seriesOptions,
  seriesNames,
  selectedSeriesIndex,
  canConfirm,
  onColorChange,
  onSeriesChange,
  onDone,
  onUndoLastClick,
  onCancelFlow,
}: SeriesPickerModalProps) => (
  <PointMarkModalOverlay open={open} onClose={onCancelFlow}>
    <DetectModalContent
      onClick={(reactEvent: React.MouseEvent) => reactEvent.stopPropagation()}
    >
      <PointMarkModalTitle>
        {SERIES_PICKER_MODAL_TITLE}
      </PointMarkModalTitle>

      <PointMarkModalSection>
        <PointMarkModalSectionLabel>{SERIES_PICKER_SECTION_COLOR}</PointMarkModalSectionLabel>
        <DetectColorSwatches>
          {colorOptions.map((colorOption) => {
            const isSelected = selectedColor === colorOption;
            const hex = DETECT_COLOR_HEX_BY_NAME[colorOption] ?? colorOption;
            return (
              <DetectColorSwatch
                key={colorOption}
                $selected={isSelected}
                $backgroundColor={hex}
                onClick={() => onColorChange(colorOption)}
                title={colorOption}
              />
            );
          })}
        </DetectColorSwatches>
      </PointMarkModalSection>

      <PointMarkModalSection>
        <PointMarkModalSectionLabel>
          {SERIES_PICKER_SECTION_DATA_SERIES}
        </PointMarkModalSectionLabel>
        <DetectSeriesFormControl fullWidth size="small">
          <InputLabel id="series-select-label">
            {SERIES_PICKER_SELECT_LABEL}
          </InputLabel>
          <DetectSeriesSelect
            labelId="series-select-label"
            label={SERIES_PICKER_SELECT_LABEL}
            value={
              selectedSeriesIndex >= 0 && seriesOptions.includes(selectedSeriesIndex)
                ? selectedSeriesIndex
                : ''
            }
            onChange={onSeriesChange}
            seriesOptions={seriesOptions}
            seriesNames={seriesNames}
          />
        </DetectSeriesFormControl>
      </PointMarkModalSection>

      <PointMarkModalButtons>
        <PointMarkModalButton
          variant="contained"
          onClick={onDone}
          disabled={!canConfirm}
          autoFocus
        >
          {SERIES_PICKER_BUTTON_SAVE}
        </PointMarkModalButton>
        <PointMarkModalButton variant="outlined" onClick={onUndoLastClick}>
          {SERIES_PICKER_BUTTON_UNDO}
        </PointMarkModalButton>
        <PointMarkModalCancel variant="outlined" onClick={onCancelFlow}>
          {SERIES_PICKER_BUTTON_START_OVER}
        </PointMarkModalCancel>
      </PointMarkModalButtons>
    </DetectModalContent>
  </PointMarkModalOverlay>
);
