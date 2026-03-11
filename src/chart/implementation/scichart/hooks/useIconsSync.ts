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

import { toSvgString } from '../../../utils/iconUtils';

const ICON_PX_BASE = 24;
const FONT_SIZE_BASE = 20;
const ICON_URL_PATTERN = /^https?:\/\//;
const ICON_FILE_PATTERN = /\.(png|jpg|jpeg|svg|gif|webp)(\?|$)/i;

export interface ChartIconInput {
  iconImage: string;
  location: { x: number; y: number };
  color?: string;
}

export interface UseIconsSyncOptions {
  icons: ChartIconInput[];
  defaultColor: string;
  iconSize: number;
}

export const useIconsSync = ({
  icons,
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
      const isSvgOrImage =
        icon.iconImage.startsWith('<') ||
        ICON_URL_PATTERN.test(icon.iconImage) ||
        ICON_FILE_PATTERN.test(icon.iconImage);
      const annotation = isSvgOrImage
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
  }, [initResult, icons, defaultColor, iconSize]);
};
