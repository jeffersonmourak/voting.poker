import { useWindowSize } from "@uidotdev/usehooks";
import { elementScrollObserver, windowScrollObserver } from "../../../hooks/ui";
import React, { useState } from "react";
import { distinctUntilChanged, distinctUntilKeyChanged, map } from "rxjs";

interface VisibleSection {
  visibleSection: number;
  // slideTo: (section: number) => void;
  // jumpTo: (section: number) => void;
}

export const useVisibleSection = (offset = 0): VisibleSection => {
  const [visibleSection, setVisibleSection] = useState<number>(0);
  const { height } = useWindowSize();

  React.useLayoutEffect(() => {
    const subscription = windowScrollObserver(height ?? 1, offset)
      .pipe(
        map(({ page }) => page),
        distinctUntilKeyChanged("index")
      )
      .subscribe(({ index }) => setVisibleSection(index));
    return () => {
      subscription.unsubscribe();
    };
  }, [height, offset]);

  return {
    visibleSection,
  };
};

export const useElementScroll = (element: HTMLElement | null) => {
  const [scrollTop, setVisibleSection] = useState<number>(0);

  React.useLayoutEffect(() => {
    if (!element) {
      return;
    }

    const subscription = elementScrollObserver(element)
      .pipe(
        map((scroll) => scroll),
        distinctUntilChanged()
      )
      .subscribe((elementScroll) => setVisibleSection(elementScroll));
    return () => {
      subscription.unsubscribe();
    };
  }, [element]);

  const scrollElement = (scroll: number) => {
    if (element) {
      element.scrollTop = scroll;
    }
  };

  return {
    scrollTop,
    scrollElement,
  };
};
