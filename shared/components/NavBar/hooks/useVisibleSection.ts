import {windowScrollObserver} from '@root/shared/hooks/ui';
import {useWindowSize} from '@uidotdev/usehooks';
import React from 'react';
import {useState} from 'react';
import {distinctUntilKeyChanged, map} from 'rxjs';

interface VisibleSection {
  visibleSection: number;
  // slideTo: (section: number) => void;
  // jumpTo: (section: number) => void;
}

export const useVisibleSection = (offset: number = 0): VisibleSection => {
  const [visibleSection, setVisibleSection] = useState<number>(0);
  const {height} = useWindowSize();

  React.useLayoutEffect(() => {
    const subscription = windowScrollObserver(height ?? 1, offset)
      .pipe(
        map(({page}) => page),
        distinctUntilKeyChanged('index')
      )
      .subscribe(({index}) => setVisibleSection(index));
    return () => {
      subscription.unsubscribe();
    };
  }, [height]);

  return {
    visibleSection,
  };
};
