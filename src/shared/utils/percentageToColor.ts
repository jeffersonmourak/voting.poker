export const percentageToColor = (percentage: number, maxHue = 120, minHue = 0) => {
  const hue = maxHue - (percentage * (maxHue - minHue) + minHue);

  return `hsl(${hue}, 100%, 70%)`;
};
