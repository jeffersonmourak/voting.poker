import { Typography } from '@mui/material';
import { DateTime, Interval } from 'luxon';
import { useEffect, useRef, useState } from 'react';
import { useInterval } from 'usehooks-ts';

const niceDigits = (n?: number) => {
  if (!n) {
    return '00';
  }

  if (n < 10) {
    return `0${n}`;
  }
  return `${n}`;
};

interface TimerProps {
  revealed: boolean;
}

export const Timer = ({ revealed }: TimerProps) => {
  const timestamp = useRef(DateTime.now());
  const [since, setSince] = useState(Interval.fromDateTimes(DateTime.now(), DateTime.now()));

  useInterval(
    () => {
      setSince(Interval.fromDateTimes(timestamp.current, DateTime.now()));
    },
    revealed ? null : 100,
  )

  useEffect(() => {
    if (!revealed) {
      timestamp.current = DateTime.now();
    }
  }, [revealed]);

  const duration = since.toDuration(['hour', 'minute', 'second', 'millisecond']).toObject();

  return (
    <Typography variant="h5">
      {niceDigits(duration.hours)}:{niceDigits(duration.minutes)}:{niceDigits(duration.seconds)}
    </Typography>
  );
};
