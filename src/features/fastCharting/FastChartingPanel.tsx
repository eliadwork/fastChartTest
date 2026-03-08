import type { FastChartingProps } from './FastCharting';

import { useState } from 'react';

import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

import { FastCharting } from './FastCharting';
import {
  FastChartingPane,
  FastChartingPaneChartSlot,
  FastChartingPaneCollapsedSlot,
  FastChartingToggleButton,
} from './FastChartingStyled';

export type FastChartingPanelProps = Omit<FastChartingProps, 'fill'>;

export const FastChartingPanel = (props: FastChartingPanelProps) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <FastChartingPane $expanded={expanded}>
      {expanded ? (
        <>
          <FastChartingToggleButton
            onClick={() => setExpanded(false)}
            size="small"
            title="Hide panel"
          >
            <ChevronRightIcon />
          </FastChartingToggleButton>
          <FastChartingPaneChartSlot>
            <FastCharting {...props} fill />
          </FastChartingPaneChartSlot>
        </>
      ) : (
        <FastChartingPaneCollapsedSlot>
          <FastChartingToggleButton
            onClick={() => setExpanded(true)}
            size="small"
            title="Show panel (20%)"
          >
            <ChevronLeftIcon />
          </FastChartingToggleButton>
        </FastChartingPaneCollapsedSlot>
      )}
    </FastChartingPane>
  );
};
