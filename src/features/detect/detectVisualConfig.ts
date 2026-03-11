import { DEFAULT_POINT_MARK_ICON_SVG } from '../../assets/pointMarkIcon';

const DEFAULT_POINT_MARK_COLORS = {
  red: '#b85c5c',
  green: '#5a9a5a',
  yellow: '#b8a84a',
} as const;

const withIconColor = (hexColor: string): string =>
  DEFAULT_POINT_MARK_ICON_SVG.replace(/\{\{color\}\}/g, hexColor);

export interface DetectVisualIconOption {
  icon: string;
  textRepresentation: string;
}

const DEFAULT_POINT_MARK_ICON_OPTIONS: DetectVisualIconOption[] = [
  { icon: withIconColor(DEFAULT_POINT_MARK_COLORS.red), textRepresentation: 'red' },
  { icon: withIconColor(DEFAULT_POINT_MARK_COLORS.green), textRepresentation: 'green' },
  { icon: withIconColor(DEFAULT_POINT_MARK_COLORS.yellow), textRepresentation: 'yellow' },
];

export interface DetectVisualConfig {
  icons: DetectVisualIconOption[];
  pendingLineColor: string;
}

export const DEFAULT_DETECT_VISUAL_CONFIG: DetectVisualConfig = {
  icons: DEFAULT_POINT_MARK_ICON_OPTIONS,
  pendingLineColor: DEFAULT_POINT_MARK_COLORS.red,
};

export const resolveDetectVisualConfig = (
  overrides: Partial<DetectVisualConfig> = {}
): DetectVisualConfig => {
  const icons =
    overrides.icons != null && overrides.icons.length > 0
      ? overrides.icons
      : DEFAULT_DETECT_VISUAL_CONFIG.icons;

  return {
    ...DEFAULT_DETECT_VISUAL_CONFIG,
    ...overrides,
    icons,
  };
};
