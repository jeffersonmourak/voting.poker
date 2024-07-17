import { percentageToColor } from './percentageToColor';

export const valueToColor = (value: number) => {
  const percentage = Math.max(0.1, Math.min(1, Math.log10(value) / 2));

  return {
    color: percentageToColor(percentage),
    percentage,
  };
};
