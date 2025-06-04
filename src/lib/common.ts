// 0.1 単位で切り捨てる関数
export const roundToPointOne: (value: number) => number = (value) => {
  if (value === 0) return 0;
  return Math.round(value * 10) / 10;
};
