import { converter, formatHex, wcagLuminance, parse } from "culori";
import type { Okhsl } from "culori";

// Create a reusable converter — culori recommends creating these once
const toOkhsl = converter("okhsl");

/**
 * Convert a hex string to an OKHsl object.
 * Culori's converter handles the full chain: hex → sRGB → OKLab → OKHsl
 */
export function hexToOkhsl(hex: string): Okhsl {
  const result = toOkhsl(hex);
  if (!result) throw new Error(`Invalid color: ${hex}`);
  return result;
}

/**
 * Convert an OKHsl object back to a hex string for display and export.
 */
export function okhslToHex(color: Okhsl): string {
  const hex = formatHex(color);
  if (!hex)
    throw new Error(`Could not convert OKHsl to hex: ${JSON.stringify(color)}`);
  return hex;
}

/**
 * Get WCAG relative luminance (0–1) for a hex color.
 * This is the Y channel in XYZ space — used directly in the contrast ratio formula.
 * Culori's wcagLuminance handles the sRGB linearization correctly.
 */
export function hexToRelativeLuminance(hex: string): number {
  const parsed = parse(hex);
  if (!parsed) throw new Error(`Invalid color for luminance: ${hex}`);
  return wcagLuminance(parsed);
}

/**
 * Extract the base hue (0–360) from a hex color in OKHsl space.
 * Used to derive a color name and as the starting point for hue shift functions.
 */
export function hexToBaseHue(hex: string): number {
  const { h } = hexToOkhsl(hex);
  return h ?? 0;
}

/**
 * Clamp a value between min and max — used throughout the scale algorithm.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
