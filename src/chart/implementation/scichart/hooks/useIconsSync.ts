/**
 * Syncs chart icons to SciChart annotations.
 * Closed hook: imports only from react, scichart, scichart-react.
 */

import { useContext, useEffect, useRef } from 'react';
import {
  CustomAnnotation,
  ECoordinateMode,
  EHorizontalAnchorPoint,
  EVerticalAnchorPoint,
  NativeTextAnnotation,
  SciChartSurface,
} from 'scichart';
import { SciChartSurfaceContext } from 'scichart-react';

const ICON_PX_BASE = 24;
const FONT_SIZE_BASE = 20;

export interface ChartIconInput {
  iconImage: string;
  location: { x: number; y: number };
  color?: string;
}

export interface UseIconsSyncOptions {
  icons: ChartIconInput[];
  defaultIcon: string;
  defaultColor: string;
  iconSize: number;
}

function toSvgString(iconImage: string, sizePx: number, color: string): string {
  if (iconImage.startsWith('<')) {
    let svg = iconImage.replace(/\{\{color\}\}/g, color);
    if (!/ viewBox=/i.test(svg)) {
      svg = svg.replace(/^<svg/, '<svg viewBox="0 0 24 24"');
    }
    svg = svg
      .replace(/ width="[^"]*"/i, '')
      .replace(/ height="[^"]*"/i, '')
      .replace(/^<svg/, `<svg width="${sizePx}" height="${sizePx}"`);
    return svg;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${sizePx}" height="${sizePx}" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" fill="${color}"/></svg>`;
}

export const useIconsSync = ({
  icons,
  defaultIcon,
  defaultColor,
  iconSize,
}: UseIconsSyncOptions) => {
  const initResult = useContext(SciChartSurfaceContext);
  const annotationRefs = useRef<(CustomAnnotation | NativeTextAnnotation)[]>([]);

  useEffect(() => {
    const surface = initResult?.sciChartSurface as SciChartSurface | undefined;
    if (!surface) return;

    const chartSurface = surface as SciChartSurface;
    const iconsToRender = [...icons];

    for (const annotationRef of annotationRefs.current) {
      chartSurface.annotations.remove(annotationRef);
      annotationRef.delete();
    }
    annotationRefs.current = [];

    const iconPx = Math.round(ICON_PX_BASE * iconSize);

    for (const icon of iconsToRender) {
      const { x, y } = icon.location;
      const color = icon.color ?? defaultColor;
      const isSvg = icon.iconImage.startsWith('<');
      const annotation = isSvg
        ? new CustomAnnotation({
            x1: x,
            y1: y,
            xCoordinateMode: ECoordinateMode.DataValue,
            yCoordinateMode: ECoordinateMode.DataValue,
            horizontalAnchorPoint: EHorizontalAnchorPoint.Center,
            verticalAnchorPoint: EVerticalAnchorPoint.Center,
            svgString: toSvgString(icon.iconImage, iconPx, color),
          })
        : new NativeTextAnnotation({
            x1: x,
            y1: y,
            xCoordinateMode: ECoordinateMode.DataValue,
            yCoordinateMode: ECoordinateMode.DataValue,
            text: icon.iconImage,
            textColor: color,
            fontSize: Math.round(FONT_SIZE_BASE * iconSize),
            horizontalAnchorPoint: EHorizontalAnchorPoint.Center,
            verticalAnchorPoint: EVerticalAnchorPoint.Center,
          });
      chartSurface.annotations.add(annotation);
      annotationRefs.current.push(annotation);
    }

    chartSurface.invalidateElement();

    return () => {
      for (const annotationRef of annotationRefs.current) {
        chartSurface.annotations.remove(annotationRef);
        annotationRef.delete();
      }
      annotationRefs.current = [];
    };
  }, [initResult, icons, defaultIcon, defaultColor, iconSize]);
};
