import type { PointMarkColor } from '../../detectConstants';

import InputLabel from '@mui/material/InputLabel';

import {
  DetectColorSwatch,
  DetectColorSwatches,
  DetectModalContent,
  DetectSeriesFormControl,
} from './DetectStyled';
import { SeriesPickerSelect } from './SeriesPickerSelect';
import {
  SeriesPickerModalButton,
  SeriesPickerModalButtons,
  SeriesPickerModalOverlay,
  SeriesPickerModalSectionLabel,
  SeriesPickerModalTitle,
  SeriesPickerSelectSection,
} from './SeriesPickerModalStyled';
import {
  SERIES_PICKER_BUTTON_SAVE,
  SERIES_PICKER_BUTTON_START_OVER,
  SERIES_PICKER_BUTTON_UNDO,
  SERIES_PICKER_MODAL_TITLE,
  SERIES_PICKER_SECTION_COLOR_HEADER,
  SERIES_PICKER_SECTION_DATA_SERIES,
  SERIES_PICKER_SELECT_LABEL,
} from './seriesPickerModalConstants';

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
  <SeriesPickerModalOverlay open={open} onClose={onCancelFlow}>
    <DetectModalContent onClick={(reactEvent: React.MouseEvent) => reactEvent.stopPropagation()}>
      <SeriesPickerModalTitle>{SERIES_PICKER_MODAL_TITLE}</SeriesPickerModalTitle>

      <SeriesPickerSelectSection>
        <SeriesPickerModalSectionLabel>
          {SERIES_PICKER_SECTION_COLOR_HEADER}
        </SeriesPickerModalSectionLabel>
        <DetectColorSwatches>
          {colorOptions.map((colorOption) => {
            const isSelected = selectedColor === colorOption;
            return (
              <DetectColorSwatch
                key={colorOption}
                $selected={isSelected}
                $backgroundColor={colorOption}
                onClick={() => onColorChange(colorOption)}
                title={colorOption}
              />
            );
          })}
        </DetectColorSwatches>
      </SeriesPickerSelectSection>

      <SeriesPickerSelectSection>
        <SeriesPickerModalSectionLabel>
          {SERIES_PICKER_SECTION_DATA_SERIES}
        </SeriesPickerModalSectionLabel>
        <DetectSeriesFormControl fullWidth size="small">
          <InputLabel id="series-select-label">{SERIES_PICKER_SELECT_LABEL}</InputLabel>
          <SeriesPickerSelect
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
      </SeriesPickerSelectSection>

      <SeriesPickerModalButtons>
        <SeriesPickerModalButton
          variant="contained"
          onClick={onDone}
          disabled={!canConfirm}
          autoFocus
        >
          {SERIES_PICKER_BUTTON_SAVE}
        </SeriesPickerModalButton>
        <SeriesPickerModalButton variant="outlined" onClick={onUndoLastClick}>
          {SERIES_PICKER_BUTTON_UNDO}
        </SeriesPickerModalButton>
        <SeriesPickerModalButton variant="outlined" onClick={onCancelFlow}>
          {SERIES_PICKER_BUTTON_START_OVER}
        </SeriesPickerModalButton>
      </SeriesPickerModalButtons>
    </DetectModalContent>
  </SeriesPickerModalOverlay>
);
