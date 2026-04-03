/**
 * WCAG 2.1 relative luminance & contrast (sRGB).
 * https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 */

export function hexToRgb(hex) {
  const h = hex.replace(/^#/, "");
  const n =
    h.length === 3
      ? h.split("").map((c) => parseInt(c + c, 16))
      : [h.slice(0, 2), h.slice(2, 4), h.slice(4, 6)].map((x) =>
          parseInt(x, 16),
        );
  if (n.some((v) => Number.isNaN(v) || v < 0 || v > 255)) {
    throw new Error(`Invalid hex: ${hex}`);
  }
  return { r: n[0], g: n[1], b: n[2] };
}

function channelLuminance(c) {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  return (
    0.2126 * channelLuminance(r) +
    0.7152 * channelLuminance(g) +
    0.0722 * channelLuminance(b)
  );
}

export function contrastRatio(hexFg, hexBg) {
  const L1 = relativeLuminance(hexFg);
  const L2 = relativeLuminance(hexBg);
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}

/** Normal text: WCAG AA 4.5:1 */
export function meetsAANormal(fg, bg) {
  return contrastRatio(fg, bg) >= 4.5;
}

/** Large text (18px+ or 14px+ bold): WCAG AA 3:1 */
export function meetsAALarge(fg, bg) {
  return contrastRatio(fg, bg) >= 3;
}
