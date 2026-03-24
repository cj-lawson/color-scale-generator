import { create } from "zustand";
import { generateScale } from "@/lib/color-engine";
import type { ScaleConfig, ScaleOutput } from "@/lib/color-engine";

interface ColorStore {
  config: ScaleConfig;
  output: ScaleOutput | null;
  selectedStep: number | null;

  // actions
  setConfig: (config: Partial<ScaleConfig>) => void;
  setSelectedStep: (step: number | null) => void;
}

const DEFAULT_CONFIG: ScaleConfig = {
  baseHex: "#0F6E56",
  steps: [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000],
  minChroma: 0.05,
  maxChroma: 0.9,
  backgroundHex: "#ffffff",
};

export const useColorStore = create<ColorStore>((set, get) => ({
  config: DEFAULT_CONFIG,
  output: generateScale(DEFAULT_CONFIG),
  selectedStep: null,

  setConfig: (partial) => {
    const config = { ...get().config, ...partial };
    set({ config, output: generateScale(config) });
  },

  setSelectedStep: (step) => set({ selectedStep: step }),
}));
