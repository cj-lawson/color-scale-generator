import type { Okhsl } from "culori";
import type { ScaleConfig, ColorStep, ScaleOutput } from "./types";
import { hexToOkhsl, okhslToHex, hexToRelativeLuminance, clamp } from "./okhsl";
import { buildWcagData } from "./accessibility";

// ─────────────────────────────────────────────
// Step 1: Hue function
// Accounts for the Bezold-Brücke effect — colors
// appear to shift hue as lightness changes.
// Blues/greens shift toward purple in shadows,
// yellows/reds shift toward yellow in highlights.
// H(n) = baseHue + 5 * (1 - n)
// ─────────────────────────────────────────────
function computeHue(normalizedStep: number, baseHue: number): number {
  return baseHue + 5 * (1 - normalizedStep);
}

// ─────────────────────────────────────────────
// Step 2: Saturation function
// Parabolic curve — colors are most saturated at
// the midpoint of the scale, grayer at extremes.
// S(n) = -4(Smax - Smin)n² + 4(Smax - Smin)n + Smin
// ─────────────────────────────────────────────
function computeSaturation(
  normalizedStep: number,
  minChroma: number,
  maxChroma: number
): number {
  const diff = maxChroma - minChroma;
  return clamp(
    -4 * diff * normalizedStep ** 2 + 4 * diff * normalizedStep + minChroma,
    0,
    1
  );
}

// ─────────────────────────────────────────────
// Step 3: Lightness function
// Bakes WCAG contrast ratios directly into the
// lightness calculation. Each step targets a
// specific contrast ratio with the background,
// derived from an exponential function so that
// steps 500 apart always have a 4.5:1 ratio.
//
// The 0.18 threshold is middle gray — the only
// luminance that passes AA on both white and black.
// Above it = light background (scale goes dark).
// Below it = dark background (scale goes light).
// ─────────────────────────────────────────────
function labLightness(Y: number): number {
  if (Y <= 0.0088564516) {
    return Y * 903.2962962;
  }
  return 116 * Math.pow(Y, 1 / 3) - 16;
}

function toeFn(l: number): number {
  const k1 = 0.206;
  const k2 = 0.03;
  const k3 = (1 + k1) / (1 + k2);
  return 0.5 * (k3 * l - k1 + Math.sqrt((k3 * l - k1) ** 2 + 4 * k2 * k3 * l));
}

function computeLightness(normalizedStep: number, backgroundY: number): number {
  let foregroundY: number;

  if (backgroundY > 0.18) {
    foregroundY = (backgroundY + 0.05) / Math.exp(3.04 * normalizedStep) - 0.05;
  } else {
    foregroundY = Math.exp(3.04 * normalizedStep) * (backgroundY + 0.05) - 0.05;
  }

  foregroundY = clamp(foregroundY, 0, 1);

  // labLightness returns 0–100, toeFn expects 0–1
  return toeFn(labLightness(foregroundY) / 100);
}

// ─────────────────────────────────────────────
// Hue → name
// Rough mapping from OKHsl hue angle to a color
// family name. Used for ScaleOutput.name.
// ─────────────────────────────────────────────
function hueToName(hue: number): string {
  const h = ((hue % 360) + 360) % 360; // normalize to 0–360
  if (h < 20) return "red";
  if (h < 45) return "orange";
  if (h < 70) return "yellow";
  if (h < 150) return "green";
  if (h < 195) return "teal";
  if (h < 255) return "blue";
  if (h < 285) return "purple";
  if (h < 320) return "pink";
  return "red";
}

// ─────────────────────────────────────────────
// Main export
// ─────────────────────────────────────────────
export function generateScale(config: ScaleConfig): ScaleOutput {
  const { baseHex, steps, minChroma, maxChroma, backgroundHex } = config;

  // derive base values from the input color
  const baseOkhsl = hexToOkhsl(baseHex);
  const baseHue = baseOkhsl.h ?? 0;
  const backgroundY = hexToRelativeLuminance(backgroundHex);
  const maxStep = Math.max(...steps);

  const colorSteps: ColorStep[] = steps.map((step) => {
    // normalize step to 0–1 range
    const n = maxStep === 0 ? 0 : step / maxStep;

    // compute OKHsl components
    const h = computeHue(n, baseHue);
    const s = computeSaturation(n, minChroma, maxChroma);
    const l = computeLightness(n, backgroundY);

    // build the OKHsl color object
    const okhslColor: Okhsl = { mode: "okhsl", h, s, l };
    const hex = okhslToHex(okhslColor);

    return {
      step,
      hex,
      okhsl: { h, s, l },
      wcag: buildWcagData(hex, backgroundHex),
    };
  });

  return {
    config,
    steps: colorSteps,
    name: hueToName(baseHue),
  };
}
