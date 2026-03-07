/**
 * Icon content utilities for point mark annotations.
 * Supports SVG (with {{color}} placeholder), image URLs, and legacy characters.
 */

export function toIconContent(iconImage: string, color?: string): string {
  const c = color ?? '#3388ff';
  if (iconImage.startsWith('<')) {
    return iconImage.replace(/\{\{color\}\}/g, c);
  }
  if (/^https?:\/\//.test(iconImage) || /\.(png|jpg|svg|gif)(\?|$)/i.test(iconImage)) {
    return `<img src="${iconImage}" style="width:100%;height:100%;object-fit:contain" alt="" />`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" fill="${c}"/></svg>`;
}

/**
 * Produce a standalone SVG string with explicit width/height/viewBox for use with
 * SciChart's CustomAnnotation (SVG-based, tracks correctly during zoom).
 */
export function toSvgString(iconImage: string, sizePx: number, color?: string): string {
  const c = color ?? '#3388ff';
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
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${sizePx}" height="${sizePx}" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" fill="${c}"/></svg>`;
}
