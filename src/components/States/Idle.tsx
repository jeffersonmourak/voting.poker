import type { AnyIdleResultState } from "@/lib/core";
import { Box, darken, styled, Typography } from "@mui/material";

import brazucaCatchingUp from "@/assets/graphics/brazuca_catching_up.png";
import brazucaSittingOnWheelchair from "@/assets/graphics/brazuca_sitting_on_wheelchair.png";

const Root = styled(Box)(({ theme }) => ({
	minHeight: "75vh",
	display: "flex",
	alignItems: "center",
	flexDirection: "column",
	gap: theme.spacing(6),
	backgroundColor: theme.palette.background.default,
	borderRadius: theme.spacing(2),
	flex: 1,
	padding: theme.spacing(4),
}));

const WaitingBlock = styled(Box)(({ theme }) => ({
	display: "flex",
	flexDirection: "column",
	justifyContent: "center",
	alignItems: "center",
	gap: theme.spacing(2),
}));

const WaitingGraphicBlock = styled(Box)(({ theme }) => ({
	position: "relative",
	width: 600,
	height: 250,
	marginBottom: theme.spacing(2),
}));

const WaitingGraphic = styled("img")(({ theme }) => ({
	borderRadius: theme.spacing(3),
	overflow: "hidden",
	display: "block",
}));

const HeroText = styled(Typography)(({ theme }) => ({
	fontFamily: ["var(--mont)", "sans-serif"].join(", "),
	...theme.typography.h2,
	fontWeight: 600,
	textAlign: "center",
	color: theme.palette.text.primary,
	letterSpacing: -2,
	wordSpacing: 2,

	[theme.breakpoints.down("sm")]: {
		...theme.typography.h4,
	},
}));

const ModeratorWarningBlock = styled(Box)(({ theme }) => ({
	backgroundColor: darken(theme.palette.background.paper, 0.4),
	borderRadius: theme.spacing(2),
	padding: `${theme.spacing(3)} ${theme.spacing(4)}`,
	display: "flex",
	gap: theme.spacing(3),
	maxWidth: theme.spacing(110),
	width: "100%",
}));

const ModeratorWarningGraphicBlock = styled(Box)(({ theme }) => ({
	position: "relative",
	width: 80,
	transform: "scale(0.7)",
	display: "flex",
	flexDirection: "row",
	justifyContent: "center",
	alignItems: "center",
}));

const ModeratorWarningGraphicImage = styled("img")(({ theme }) => ({}));

interface PoolStateComponentProps {
	state: AnyIdleResultState;
}

const IdleStateComponent: React.FC<PoolStateComponentProps> = ({ state }) => {
	return (
		<Root>
			<WaitingBlock>
				<WaitingGraphicBlock>
					<WaitingGraphic
						src={brazucaCatchingUp}
						alt="Graphic of people chatting in the living room. Brazuca, By Cezar Berje"
					/>
				</WaitingGraphicBlock>
				<HeroText variant="h1">
					Let's get started! <br />
				</HeroText>
			</WaitingBlock>
			<ModeratorWarningBlock>
				<ModeratorWarningGraphicBlock>
					<ModeratorWarningGraphicImage
						src={brazucaSittingOnWheelchair}
						alt="Graphic of person waving on a wheelchair. Brazuca, By Cezar Berje"
					/>
				</ModeratorWarningGraphicBlock>

				<Box flex={1} gap={2} display={"flex"} flexDirection={"column"}>
					{!state.moderator ? (
						<Typography variant="body1" sx={{ fontWeight: 500 }}>
							Howdy!
							<br />
							<br />
							Just a heads up, the voting's about to start when the moderator
							gives the signal.
							<br />
							But hold onto your hats – your team can join the party whenever
							they're ready.
							<strong style={{ fontWeight: 600, whiteSpace: "nowrap" }}>
								No waiting required!
							</strong>
						</Typography>
					) : (
						<Typography variant="body1" sx={{ fontWeight: 500 }}>
							Howdy, moderator!
							<br />
							<br />
							Just wanted to let you know, as soon as you give the signal, the
							voting floodgates will open!
							<br />
							Oh, and by the way,{" "}
							<strong style={{ fontWeight: 600 }}>
								there's no need to wait for next session.
							</strong>{" "}
							Your eager participants can jump in and start voting whenever
							they're ready. Let the games begin!
						</Typography>
					)}
				</Box>
			</ModeratorWarningBlock>
		</Root>
	);
};

export default IdleStateComponent;
