import {Typography} from '@mui/material';
import {useEffect, useState} from 'react';
import {DateTime, Interval} from 'luxon';
import {useSession} from '../hooks/useSession';

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
  roomId: string;
}

export const Timer = ({roomId}: TimerProps) => {
  const [since, setSince] = useState(Interval.fromDateTimes(DateTime.now(), DateTime.now()));
  const {session} = useSession(roomId);
  const {revealed, timestamp} = session ?? {revealed: false, timestamp: new Date()};

  useEffect(() => {
    const timer = setInterval(() => {
      if (!revealed) {
        setSince(Interval.fromDateTimes(timestamp, DateTime.now()));
      }
    }, 100);

    return () => {
      clearInterval(timer);
    };
  }, [timestamp]);

  const duration = since.toDuration(['hour', 'minute', 'second', 'millisecond']).toObject();

  return (
    <Typography variant="h5">
      {niceDigits(duration.hours)}:{niceDigits(duration.minutes)}:{niceDigits(duration.seconds)}
    </Typography>
  );
};
