import type { FontOption } from "../types";

// 0.1 単位で切り捨てる関数
export const roundToPointOne: (value: number) => number = (value) => {
  if (value === 0) return 0;
  return Math.round(value * 10) / 10;
};

export const hexToRgb: (hex: string) => string = (hex: string) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
};

export const extractRGBA: (rgbop: string) => string = (rgbop: string) => {
  const match = rgbop.match(/rgb?\((\d+)\s*(\d+)\s*(\d+)\s*\/\s*(\d*\.?\d+)%\s*\)/);
  if (!match) return "0,0,0,0";

  const r = match[1];
  const g = match[2];
  const b = match[3];
  const a = match[4];

  return `${r},${g},${b},${a}`;
};

export const rgbToHex: (r: number, g: number, b: number) => string = (r, g, b) => {
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};

export const isAvailableFont: (document: Document, font: FontOption) => boolean = (document, font) => {
  // baseフォントの場合は常にtrueを返す
  const baseFonts = ["monospace", "sans-serif", "serif"];
  for (const baseFont of baseFonts) {
    if (font.value === baseFont) {
      return true;
    }
  }

  // フォントを指定して描画してサイズを比較する
  const testString = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) return true; // コンテキストが取得できない場合はフォントが利用可能とみなす

  // ベースフォントでのサイズを取得
  for (const baseFont of baseFonts) {
    context.font = `72px ${baseFont}`;
    const baselineSize = context.measureText(testString).width;
    context.font = `72px ${font.value}`;
    const newSize = context.measureText(testString).width;

    // ベースフォントと比較してサイズが変わらない場合はフォントが利用不可
    if (newSize === baselineSize) {
      canvas.remove();
      return false;
    }
  }

  canvas.remove();
  return true;
};
