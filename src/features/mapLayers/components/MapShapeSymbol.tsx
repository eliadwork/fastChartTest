import type { MapLeafShape } from '../types';

import { MAP_FALLBACK_COLOR } from '../mapLayersConstants';

export interface MapShapeSymbolProps {
  shape: MapLeafShape;
  color?: string;
  variant?: 'legend' | 'card';
}

const SYMBOL_DIMENSIONS_BY_VARIANT = {
  legend: {
    dot: 9,
    circle: 11,
    polygonWidth: 12,
    polygonHeight: 10,
    lineWidth: 18,
    strokeWidth: 2,
  },
  card: {
    dot: 10,
    circle: 12,
    polygonWidth: 13,
    polygonHeight: 11,
    lineWidth: 20,
    strokeWidth: 2,
  },
} as const;

const resolveMapShapeColor = (color?: string) => {
  if (color != null && color.trim() !== '') {
    return color;
  }

  return MAP_FALLBACK_COLOR;
};

export const MapShapeSymbol = ({
  shape,
  color,
  variant = 'legend',
}: MapShapeSymbolProps) => {
  const strokeColor = resolveMapShapeColor(color);
  const dimensions = SYMBOL_DIMENSIONS_BY_VARIANT[variant];

  if (shape === 'dot') {
    return (
      <span
        aria-hidden="true"
        style={{
          width: `${dimensions.dot}px`,
          height: `${dimensions.dot}px`,
          borderRadius: '50%',
          backgroundColor: strokeColor,
          display: 'inline-block',
          flexShrink: 0,
        }}
      />
    );
  }

  if (shape === 'line') {
    return (
      <span
        aria-hidden="true"
        style={{
          width: `${dimensions.lineWidth}px`,
          borderBottom: `${dimensions.strokeWidth}px dashed ${strokeColor}`,
          display: 'inline-block',
          flexShrink: 0,
        }}
      />
    );
  }

  if (shape === 'circle') {
    return (
      <span
        aria-hidden="true"
        style={{
          width: `${dimensions.circle}px`,
          height: `${dimensions.circle}px`,
          border: `${dimensions.strokeWidth}px solid ${strokeColor}`,
          borderRadius: '50%',
          display: 'inline-block',
          boxSizing: 'border-box',
          flexShrink: 0,
        }}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      style={{
        width: `${dimensions.polygonWidth}px`,
        height: `${dimensions.polygonHeight}px`,
        border: `${dimensions.strokeWidth}px solid ${strokeColor}`,
        borderRadius: '2px',
        display: 'inline-block',
        boxSizing: 'border-box',
        flexShrink: 0,
      }}
    />
  );
};
