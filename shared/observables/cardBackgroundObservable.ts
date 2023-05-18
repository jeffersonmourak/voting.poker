import {of, switchMap, ObservableInput, from} from 'rxjs';

import {isNaN} from 'lodash';
import {GiphyFetch} from '@giphy/js-fetch-api';

export type CardBackgroundData = {
  value: string;
  background: string;
  height: number;
  isImage?: boolean;
};

const percentageToColor = (percentage: number, maxHue = 120, minHue = 0) => {
  const hue = maxHue - (percentage * (maxHue - minHue) + minHue);

  return `hsl(${hue}, 100%, 70%)`;
};

const displayPercentage = (value: number): ObservableInput<CardBackgroundData> => {
  const height = Math.max(0.1, Math.min(1, Math.log10(value) / 2));

  return of({
    value: value.toString(),
    background: percentageToColor(height),
    height: height * 250,
  });
};

const valueToSearchKey = (value: string) => {
  switch (value) {
    case '?':
      return 'idk';
    case '☕️':
      return 'coffee break';
    default:
      return value;
  }
};

const displayGif = async (value: string): Promise<CardBackgroundData> => {
  const gf = new GiphyFetch(process.env.NEXT_PUBLIC_GIPHY_KEY ?? '');

  const {data} = await gf.search(valueToSearchKey(value));

  return {
    value,
    background: `url(${data[0].images.original.url})`,
    height: 250,
    isImage: true,
  };
};

export const cardBackgroundObservable = (value: string) =>
  of({value}).pipe(
    switchMap(({value}) => {
      const size = Number(value);

      if (isNaN(size)) {
        return from(displayGif(value));
      }

      return displayPercentage(size);
    })
  );
