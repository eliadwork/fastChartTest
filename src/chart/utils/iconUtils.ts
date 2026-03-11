/**
 * Icon content utilities for point mark annotations.
 * Supports SVG (with {{color}} placeholder), image URLs, and legacy characters.
 */

import { CHART_DEFAULT_ICON_COLOR } from '../defaultsChartStyles';

const ICON_URL_PATTERN = /^https?:\/\//;
const ICON_FILE_PATTERN = /\.(png|jpg|jpeg|svg|gif|webp)(\?|$)/i;

const isIconUrl = (iconImage: string): boolean =>
  ICON_URL_PATTERN.test(iconImage) || ICON_FILE_PATTERN.test(iconImage);

const escapeAttr = (value: string): string => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;');

export function toIconContent(iconImage: string, color?: string): string {
  const c = color ?? CHART_DEFAULT_ICON_COLOR;
  if (iconImage.startsWith('<')) {
    return iconImage.replace(/\{\{color\}\}/g, c);
  }
  if (isIconUrl(iconImage)) {
    return `<img src="${iconImage}" style="width:100%;height:100%;object-fit:contain" alt="" />`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" fill="${c}"/></svg>`;
}

/**
 * Produce a standalone SVG string with explicit width/height/viewBox for use with
 * SciChart's CustomAnnotation (SVG-based, tracks correctly during zoom).
 */
export function toSvgString(iconImage: string, sizePx: number, color?: string): string {
  const c = color ?? CHART_DEFAULT_ICON_COLOR;
  if (iconImage.startsWith('<')) {
    let svg = iconImage.replace(/\{\{color\}\}/g, c);
    if (!/ viewBox=/i.test(svg)) {
      svg = svg.replace(/^<svg/, '<svg viewBox="0 0 24 24"');
    }
    svg = svg
      .replace(/ width="[^"]*"/i, '')
      .replace(/ height="[^"]*"/i, '')
      .replace(/^<svg/, `<svg width="${sizePx}" height="${sizePx}"`);
    return svg;
  }
  if (isIconUrl(iconImage)) {
    const safeUrl = escapeAttr(iconImage);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${sizePx}" height="${sizePx}" viewBox="0 0 24 24"><image href="${safeUrl}" x="0" y="0" width="24" height="24" preserveAspectRatio="xMidYMid meet" /></svg>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${sizePx}" height="${sizePx}" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" fill="${c}"/></svg>`;
}
