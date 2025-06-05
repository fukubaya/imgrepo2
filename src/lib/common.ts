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

export const rgbToHex: (r: number, g: number, b: number) => string = (r, g, b) => {
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};
