import type { LegendTreeNode } from '../../../shared/legend';

import { LegendTree } from '../../../shared/legend';

export interface MapLayerLegendProps {
  nodes: LegendTreeNode[];
  onToggle: (nodeId: string, nextChecked: boolean) => void;
}

export const MapLayerLegend = ({ nodes, onToggle }: MapLayerLegendProps) => (
  <LegendTree nodes={nodes} onToggle={onToggle} withCheckbox={false} zIndex={1200} />
);
