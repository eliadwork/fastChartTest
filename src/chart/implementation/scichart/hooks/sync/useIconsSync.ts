/**
 * Syncs chart icons to SciChart annotations.
 */

import { useEffect, useRef } from 'react';
import {
  CustomAnnotation,
  ECoordinateMode,
  EHorizontalAnchorPoint,
  EVerticalAnchorPoint,
  NativeTextAnnotation,
  SciChartSurface,
} from 'scichart';

import { toSvgString } from '../../../../utils/iconUtils';
import type { ResolvedSciChartIcon } from '../../scichartOptions';

const ICON_PX_BASE = 24;
const FONT_SIZE_BASE = 20;
const ICON_URL_PATTERN = /^https?:\/\//;
const ICON_FILE_PATTERN = /\.(png|jpg|jpeg|svg|gif|webp)(\?|$)/i;

export interface UseIconsSyncOptions {
  surface?: SciChartSurface;
  icons: ResolvedSciChartIcon[];
}

export const useIconsSync = ({ surface, icons }: UseIconsSyncOptions) => {
  const annotationRefs = useRef<(CustomAnnotation | NativeTextAnnotation)[]>([]);

  useEffect(() => {
    if (!surface) return;
    const iconsToRender = [...icons];

    for (const annotationRef of annotationRefs.current) {
      surface.annotations.remove(annotationRef);
      annotationRef.delete();
    }
    annotationRefs.current = [];

    for (const icon of iconsToRender) {
      const { x, y } = icon.location;
      const color = icon.color;
      const iconSize = icon.size;
      const iconPx = Math.round(ICON_PX_BASE * iconSize);
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
      surface.annotations.add(annotation);
      annotationRefs.current.push(annotation);
    }

    surface.invalidateElement();

    return () => {
      for (const annotationRef of annotationRefs.current) {
        surface.annotations.remove(annotationRef);
        annotationRef.delete();
      }
      annotationRefs.current = [];
    };
  }, [surface, icons]);
};
