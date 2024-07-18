import { ObservableInput, from, of, switchMap } from 'rxjs';

import { GiphyFetch } from '@giphy/js-fetch-api';
import { valueToColor } from '@voting.poker/next/helpers/valueColorScale';
import { isNaN } from 'lodash';

export type CardBackgroundData = {
  value: string;
  background: string;
  height: number;
  isImage?: boolean;
};

const displayPercentage = (value: number): ObservableInput<CardBackgroundData> => {
  const {percentage: height, color} = valueToColor(value);

  return of({
    value: value.toString(),
    background: color,
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
    background: data[0].images.original.url,
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
