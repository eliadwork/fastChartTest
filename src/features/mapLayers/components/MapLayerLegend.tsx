import type { LegendTreeNode } from '../../../shared/legend';

import { LegendTree } from '../../../shared/legend';

export interface MapLayerLegendProps {
  nodes: LegendTreeNode[];
  onToggle: (nodeId: string, nextChecked: boolean) => void;
  onNodeDoubleClick?: (nodeId: string) => void;
}

export const MapLayerLegend = ({ nodes, onToggle, onNodeDoubleClick }: MapLayerLegendProps) => (
  <LegendTree
    nodes={nodes}
    onToggle={onToggle}
    onNodeDoubleClick={onNodeDoubleClick}
    withCheckbox={false}
    zIndex={1200}
  />
);
