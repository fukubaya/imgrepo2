import type { TextEffectPreset } from "../types";

// テキスト効果プリセット
export const TEXT_EFFECT_PRESETS: Record<string, TextEffectPreset> = {
  // 標準
  normal: {
    name: "標準",
    shadow: null,
    stroke: null,
    strokeWidth: 0,
    fontWeight: "normal",
    fontStyle: "normal",
  },

  // ドロップシャドウ
  shadow: {
    name: "ドロップシャドウ",
    shadow: {
      color: "rgba(0,0,0,0.6)",
      blur: 5,
      offsetX: 5,
      offsetY: 5,
    },
    stroke: null,
    strokeWidth: 0,
  },

  // アウトライン
  outline: {
    name: "アウトライン",
    shadow: null,
    stroke: "#ffffff",
    strokeWidth: 2,
  },

  // ネオン
  neon: {
    name: "ネオン",
    shadow: {
      color: "#00ffff",
      blur: 15,
      offsetX: 0,
      offsetY: 0,
    },
    stroke: "#ffffff",
    strokeWidth: 1,
    fill: "#00ffff",
  },

  // レトロ
  retro: {
    name: "レトロ",
    shadow: {
      color: "rgba(255,100,0,0.8)",
      blur: 3,
      offsetX: 3,
      offsetY: 3,
    },
    stroke: "#8B4513",
    strokeWidth: 1,
    fontWeight: "bold",
  },

  // 3D
  "3d": {
    name: "3D",
    shadow: {
      color: "rgba(0,0,0,0.5)",
      blur: 1,
      offsetX: 4,
      offsetY: 4,
    },
    stroke: "#ffffff",
    strokeWidth: 1,
  },

  // 手書き風
  handwritten: {
    name: "手書き風",
    shadow: {
      color: "rgba(0,0,0,0.2)",
      blur: 2,
      offsetX: 1,
      offsetY: 1,
    },
    stroke: null,
    strokeWidth: 0,
    fontStyle: "italic",
  },

  // ポップ
  pop: {
    name: "ポップ",
    shadow: null,
    stroke: "#000000",
    strokeWidth: 3,
    fontWeight: "bold",
  },
};

// デフォルトのテキスト効果
export const DEFAULT_TEXT_EFFECT = "normal";
