import { wcagContrast, parse } from "culori";
import { hexToRelativeLuminance } from "./okhsl";

/** WCAG contrast level badges */
export type WcagLevel = "AAA" | "AA" | "FAIL";

/**
 * Calculate the WCAG 2.1 contrast ratio between two hex colors.
 * Returns a ratio like 4.5 (meaning 4.5:1).
 * Culori's wcagContrast handles luminance ordering automatically.
 */
export function contrastRatio(hexA: string, hexB: string): number {
  const a = parse(hexA);
  const b = parse(hexB);
  if (!a || !b) throw new Error(`Invalid colors: ${hexA}, ${hexB}`);
  // round to 2 decimal places — matches how contrast checkers display ratios
  return Math.round(wcagContrast(a, b) * 100) / 100;
}

/**
 * Determine the WCAG level for a given contrast ratio.
 * AA  = 4.5:1 minimum (normal text)
 * AAA = 7.0:1 minimum (enhanced)
 */
export function wcagLevel(ratio: number): WcagLevel {
  if (ratio >= 7) return "AAA";
  if (ratio >= 4.5) return "AA";
  return "FAIL";
}

/**
 * Build the full wcag object for a ColorStep.
 * Calculates contrast against white, black, and the user's background color.
 * passesAA / passesAAA are true if ANY of the three pairings pass — this means
 * the color is usable somewhere in the scale, even if not on every background.
 */
export function buildWcagData(
  hex: string,
  backgroundHex: string
): {
  onWhite: number;
  onBlack: number;
  onBackground: number;
  passesAA: boolean;
  passesAAA: boolean;
} {
  const onWhite = contrastRatio(hex, "#ffffff");
  const onBlack = contrastRatio(hex, "#000000");
  const onBackground = contrastRatio(hex, backgroundHex);

  // passesAA = this color is usable AS TEXT on white, black, or the background
  const passesAA = onWhite >= 4.5 || onBlack >= 4.5 || onBackground >= 4.5;
  const passesAAA = onWhite >= 7 || onBlack >= 7 || onBackground >= 7;

  return { onWhite, onBlack, onBackground, passesAA, passesAAA };
}

/**
 * Given a background luminance (Yb), determine which direction the scale
 * runs. Light backgrounds (Yb > 0.18) go dark-to-light. Dark backgrounds
 * go light-to-dark. The 0.18 threshold is the luminance of middle gray —
 * the only value that passes AA against both pure white and pure black.
 */
export function isLightBackground(backgroundHex: string): boolean {
  return hexToRelativeLuminance(backgroundHex) > 0.18;
}
