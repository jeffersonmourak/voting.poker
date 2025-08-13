import { Box, styled, Typography, useTheme } from "@mui/material";

import { groupBy } from "lodash";
import { ResultValue } from "../Results/ResultValue";
import { ResultValueBig } from "../Results/ResultValueBig";
import type { AnyIdleResultState, User } from "@/lib/core";
import { valueToColor } from "@/helpers/valueColorScale";

const Content = styled(Box)(({ theme }) => ({
	width: "100%",
	display: "flex",
	flexDirection: "column",
	backgroundColor: theme.palette.background.default,
	borderRadius: theme.spacing(2),
	padding: theme.spacing(4, 6),
	flex: 1,
}));

const Hero = styled(Box)<{ "data-empty": boolean }>(
	({ theme, "data-empty": empty }) => ({
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "center",
		padding: theme.spacing(8, 0, 6),
		gap: theme.spacing(4),
		height: empty ? "100%" : "unset",
	}),
);

const ResultList = styled(Box)(({ theme }) => ({
	display: "flex",
	justifyContent: "center",
	alignItems: "center",
	gap: theme.spacing(10),
}));

interface Result {
	state: AnyIdleResultState;
}

const toResultData =
	(
		sessionVotesResult: [
			string,
			(User & {
				vote: string;
			})[],
		][],
		totals: number,
		stringColors: Record<string, string>,
	) =>
	([value, users]: [
		string,
		(User & {
			vote: string;
		})[],
	]) => {
		const { color } = Number.isNaN(Number(value))
			? { color: stringColors[value] || "#f0f" }
			: valueToColor(Number(value));

		return {
			title: value,
			value: users.length,
			from: users,
			percentage: (users.length / totals) * 100,
			color,
		};
	};

const ResultStateComponent: React.FC<Result> = ({ state }) => {
	const theme = useTheme();

	const votesEntries = Object.entries(state.votes);

	const sessionVotesResult = Object.entries(
		groupBy(votesEntries, ([_, vote]) => vote),
	).map(([vote, ids]) => {
		const users = ids.map(([id]) => {
			const user = state.users.find((user) => user.id === id);

			if (!user) {
				return {
					id,
					name: "Unknown",
					emoji: "🤷",
					moderator: false,
					vote,
				};
			}

			return {
				...user,
				vote,
			};
		});

		return [vote, users] as [string, (User & { vote: string })[]];
	});

	const results = sessionVotesResult
		.map(
			toResultData(sessionVotesResult, votesEntries.length, {
				"?": theme.palette.info.dark,
				"☕️": theme.palette.warning.dark,
			}),
		)
		.sort((a, b) => b.percentage - a.percentage);

	const [firstPlace, ...rest] = results;

	return (
		<Content>
			<Hero data-empty={results.length === 0}>
				<Typography variant="h1">
					{results.length > 0 ? (
						<strong>Well Done!</strong>
					) : (
						<strong>Well... No votes casted</strong>
					)}
				</Typography>
			</Hero>
			<ResultList>
				{firstPlace && (
					<ResultValueBig
						value={firstPlace.title}
						percentage={firstPlace.percentage}
						color={firstPlace.color}
						from={firstPlace.from}
					/>
				)}
				<Box>
					{rest.map(({ title, percentage, color, from }) => (
						<ResultValue
							key={title}
							value={title}
							percentage={percentage}
							color={color}
							from={from}
						/>
					))}
				</Box>
			</ResultList>
		</Content>
	);
};

export default ResultStateComponent;
