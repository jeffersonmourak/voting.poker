import {random, pullAt} from 'lodash';
import {
  interval,
  takeWhile,
  of,
  switchScan,
  ObservableInput,
  Observable,
  distinctUntilKeyChanged,
  delay,
} from 'rxjs';

type Messages = {
  left: string[];
  message?: string;
  end: boolean;
  action: string;
  startedAt: number;
};

const messages = [
  '🚀 Revamp your avatar! Level up your planning game with a fresh profile picture.',
  '🎨 Give your avatar a makeover! Update your profile picture and plan with style.',
  '✨ Refresh your avatar, redefine yourself.',
  '✨ Spice up your avatar with some GIF magic! ',
  '🌈 Level up your avatar with the magic of GIFs!',
  '⚡ Planning just got a whole lot more exciting! Update your avatar with a GIF and let the animated adventures unfold in your planning tool!',
  '📢 Attention! Say it with GIFs! Update your avatar and make your planning tool come alive with animated expressions! ',
  `🎉 It's GIF o'clock! Give your avatar a makeover and express yourself with animated awesomeness!`,
];

const displayMessage = (messages: string[], startedAt = 0): Observable<Messages> => {
  const left = [...messages];
  const index = random(0, left.length - 1);
  const message = pullAt(left, index)[0];

  return of({
    left,
    message,
    end: false,
    action: 'display',
    startedAt,
  });
};

const hideMessage = (
  left: string[],
  message?: string,
  startedAt = 0,
  end = false
): Observable<Messages> => {
  return of({
    left,
    message,
    end,
    action: 'hide',
    startedAt,
  });
};

export const avatarMessagesObservable = interval(1000).pipe(
  delay(10000),
  switchScan<number, Messages, ObservableInput<Messages>>(
    (previous, index) => {
      const {action, message, left, startedAt} = previous;
      const delta = index - startedAt;

      switch (action) {
        case 'display':
          if (delta >= 10) {
            return hideMessage(left, message, index, left.length === 0);
          }
          return of(previous);
        case 'hide':
          if (delta >= 120 && left.length > 0) {
            return displayMessage(left, index);
          }
          return of(previous);
        default:
          return of(previous);
      }
    },
    {
      left: [...messages],
      message: messages[0],
      end: false,
      action: 'display',
      startedAt: 0,
    }
  ),
  distinctUntilKeyChanged('action'),
  takeWhile((k) => !k.end)
);
