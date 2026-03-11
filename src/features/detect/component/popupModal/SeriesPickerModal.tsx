import InputLabel from '@mui/material/InputLabel';
import type { DetectVisualIconOption } from '../../detectVisualConfig';

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
  SERIES_PICKER_SELECT_LABEL_ID,
} from './seriesPickerModalConstants';

export interface SeriesPickerModalProps {
  open: boolean;
  iconOptions: DetectVisualIconOption[];
  selectedColor?: string;
  seriesOptions: number[];
  seriesNames: string[];
  selectedSeriesIndex: number;
  canConfirm: boolean;
  onColorChange: (color: string) => void;
  onSeriesChange: (seriesIndex: number) => void;
  onDone: () => void;
  /** Undo the last click (back to 2 clicks). */
  onUndoLastClick: () => void;
  /** Cancel the entire 3-click flow and start over. */
  onCancelFlow: () => void;
}

export const SeriesPickerModal = ({
  open,
  iconOptions,
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
          {iconOptions.map((iconOption) => {
            const isSelected = selectedColor === iconOption.textRepresentation;
            return (
              <DetectColorSwatch
                key={iconOption.textRepresentation}
                $selected={isSelected}
                onClick={() => onColorChange(iconOption.textRepresentation)}
                title={iconOption.textRepresentation}
              >
                <span
                  aria-hidden
                  // visual config is app-owned; render SVG preview exactly as provided
                  dangerouslySetInnerHTML={{ __html: iconOption.icon }}
                />
              </DetectColorSwatch>
            );
          })}
        </DetectColorSwatches>
      </SeriesPickerSelectSection>

      <SeriesPickerSelectSection>
        <SeriesPickerModalSectionLabel>
          {SERIES_PICKER_SECTION_DATA_SERIES}
        </SeriesPickerModalSectionLabel>
        <DetectSeriesFormControl fullWidth size="small">
          <InputLabel id={SERIES_PICKER_SELECT_LABEL_ID}>{SERIES_PICKER_SELECT_LABEL}</InputLabel>
          <SeriesPickerSelect
            labelId={SERIES_PICKER_SELECT_LABEL_ID}
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
