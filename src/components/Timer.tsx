import { styled, Typography } from "@mui/material";
import { DateTime, Interval } from "luxon";
import { useEffect, useRef, useState } from "react";
import { useInterval } from "usehooks-ts";

const AnimatedDigits = styled(Typography)<{ "data-in-session": boolean }>(
	({ theme, "data-in-session": inSession }) => ({
		transition: "color 0.5s, height 0.3s",
		color: inSession ? "inherit" : "transparent",
		height: inSession ? "28px" : 0,
	}),
);

const niceDigits = (n?: number) => {
	if (!n) {
		return "00";
	}

	if (n < 10) {
		return `0${n}`;
	}
	return `${n}`;
};

interface TimerProps {
	revealed: boolean;
	inSession: boolean;
}

export const Timer = ({ revealed, inSession }: TimerProps) => {
	const timestamp = useRef(DateTime.now());
	const [since, setSince] = useState(
		Interval.fromDateTimes(DateTime.now(), DateTime.now()),
	);

	const timerRunning = !inSession || revealed;

	useInterval(
		() => {
			setSince(Interval.fromDateTimes(timestamp.current, DateTime.now()));
		},
		timerRunning ? null : 100,
	);

	useEffect(() => {
		if (!timerRunning) {
			timestamp.current = DateTime.now();
		}
	}, [timerRunning]);

	const duration = since
		.toDuration(["hour", "minute", "second", "millisecond"])
		.toObject();

	return (
		<AnimatedDigits
			data-component="digits"
			data-in-session={inSession}
			variant="h5"
		>
			{niceDigits(duration.hours)}:{niceDigits(duration.minutes)}:
			{niceDigits(duration.seconds)}
		</AnimatedDigits>
	);
};
