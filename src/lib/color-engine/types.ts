// Input: what the user configures
export interface ScaleConfig {
  baseHex: string; // brand color, e.g. "#0F6E56"
  steps: number[]; // e.g. [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000]
  minChroma: number; // 0–1, how gray the ends of the scale are (0 = fully gray)
  maxChroma: number; // 0–1, how saturated the middle is (1 = full saturation)
  backgroundHex: string; // used for adaptive light/dark scaling, e.g. "#ffffff"
}

// Output: one step in the generated scale
export interface ColorStep {
  step: number; // e.g. 500
  hex: string; // e.g. "#0F6E56"
  okhsl: {
    h: number; // hue 0–360
    s: number; // saturation 0–1
    l: number; // lightness 0–1
  };
  wcag: {
    onWhite: number; // contrast ratio against #ffffff
    onBlack: number; // contrast ratio against #000000
    onBackground: number; // contrast ratio against ScaleConfig.backgroundHex
    passesAA: boolean; // true if any pairing passes 4.5:1
    passesAAA: boolean; // true if any pairing passes 7:1
  };
}

// Output: the full generated scale
export interface ScaleOutput {
  config: ScaleConfig;
  steps: ColorStep[];
  name: string; // e.g. "green", derived from base hue
}
