import {useWindowSize} from '@uidotdev/usehooks';
import React, {useState} from 'react';
import {fromEvent, map} from 'rxjs';

interface WindowScrollData {
  y: number;
}

interface PageData {
  index: number;
  progress: number;
}

interface ScrollPageData {
  window: WindowScrollData;
  page: PageData;
}

export const windowScrollObserver = (height: number, pixelOffset: number = 0) =>
  fromEvent(window, 'scroll').pipe(
    map(() => {
      const y = window.scrollY + pixelOffset;

      const index = Math.floor(y / height);
      const progress = (y % height) / height;

      return {
        window: {
          y: window.scrollY,
        },
        page: {
          index,
          progress,
        },
      };
    })
  );

export const useScrollPage = (offset: number = 0): ScrollPageData => {
  const {height: windowHeight} = useWindowSize();
  const [pageData, setPageData] = useState<ScrollPageData>({
    window: {
      y: 0,
    },
    page: {
      index: 0,
      progress: 0,
    },
  });

  React.useLayoutEffect(() => {
    const height = windowHeight ?? 1;

    const subscription = windowScrollObserver(height, offset).subscribe(setPageData);
    return () => {
      subscription.unsubscribe();
    };
  }, [windowHeight, offset]);

  return pageData;
};
