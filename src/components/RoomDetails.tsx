import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import {
	Box,
	Button,
	styled,
	Typography,
	useMediaQuery,
	useTheme,
} from "@mui/material";
import { useState } from "react";
import { InviteUrl } from "@/components/InviteUrl";
import ModeratorControls from "@/components/ModeratorControls";
import SessionVotesSummary from "@/components/SessionVotesSummary";
import { Timer } from "@/components/Timer";
import { useRoom } from "@/hooks/useRoom";
import { VotingStates } from "@/lib/machines/voting/states";
import type { User } from "@/lib/core";
import { BASE_URL } from "@/constants";

const Root = styled(Box)(({ theme }) => ({
	display: "flex",
	alignItems: "center",
	justifyContent: "space-between",
	overflowY: "auto",
	position: "sticky",
	top: 0,
	zIndex: 100,
	backdropFilter: "blur(16px)",
	border: `1px solid ${theme.palette.divider}`,
	padding: theme.spacing(2, 5),

	[theme.breakpoints.down("sm")]: {
		height: "auto",
		padding: theme.spacing(2, 3),
		overflowY: "visible",
	},
}));

const Section = styled(Box)(({ theme }) => ({
	display: "flex",
	flexDirection: "column",
	gap: theme.spacing(0.5),

	"& .MuiTypography-subtitle1": {
		textAlign: "left",
		width: "100%",
	},
}));

const Group = styled(Box)(({ theme }) => ({
	display: "flex",
	gap: theme.spacing(2),
}));

interface RoomDetailsProps {
	roomId: string;
	user: User | null;
	users: User[];
}

const RoomDetails = ({ roomId, user, users }: RoomDetailsProps) => {
	const theme = useTheme();
	const isMoble = useMediaQuery(theme.breakpoints.down("sm"));
	const [mobileOpen, setMobileOpen] = useState(false);
	const room = useRoom();

	const inSession = [VotingStates.Pool, VotingStates.PoolVote].includes(
		room.state.state,
	);
	const revealed = room.state.state === VotingStates.PoolResult;

	const isMobileOpen = !isMoble || mobileOpen;

	const handleReleaseModerator = () => {
		const user = room.state.currentUser;
		if (!user) {
			return;
		}
		room.updateUser({ ...user, moderator: false });
	};

	const handleEndSession = () => {
		if (
			!room.state.moderator ||
			(room.state.state !== VotingStates.Pool &&
				room.state.state !== VotingStates.PoolVote)
		) {
			return;
		}

		room.state.endSession();
	};

	const handleStartSession = () => {
		if (
			!room.state.moderator ||
			(room.state.state !== VotingStates.Idle &&
				room.state.state !== VotingStates.PoolResult)
		) {
			return;
		}
		room.state.startSession();
	};

	return (
		<Root sx={{ boxShadow: 9 }}>
			<Group>
				<Section
					sx={{
						cursor: "default",
						height: "48px",
						width: "135px",
						overflow: "hidden",
						"&:hover": {
							"&:hover [data-component='digits']": {
								color: "inherit",
								height: "28px",
							},
						},
					}}
				>
					<Typography
						sx={{
							lineHeight: 1,
							flex: 1,
							display: "flex",
							alignItems: "center",
							opacity: inSession ? 1 : 0.5,
							height: !inSession && !revealed ? "48px" : "unset",
						}}
						variant="subtitle1"
					>
						{!inSession && !revealed ? "Waiting..." : "Session duration"}
					</Typography>
					<Timer inSession={inSession} revealed={revealed} />
				</Section>
				{user?.moderator && (
					<Section>
						<ModeratorControls
							onReleaseModerator={handleReleaseModerator}
							onSessionEnd={handleEndSession}
							onSessionStart={handleStartSession}
						/>
					</Section>
				)}
			</Group>
			<Box flex={1}>
				<Section>
					<SessionVotesSummary userId={user?.id} users={users} />
				</Section>
			</Box>

			{isMobileOpen && (
				<Section flex={0} width={300}>
					<Typography variant="subtitle1">Invite participants</Typography>
					<InviteUrl value={`${BASE_URL}/${roomId}`} />
				</Section>
			)}
			{isMoble && (
				<Button
					variant="text"
					color="secondary"
					onClick={() => setMobileOpen((e) => !e)}
				>
					<ExpandMoreRoundedIcon
						sx={{
							transform: mobileOpen ? "rotate(180deg)" : "rotate(0deg)",
							transition: theme.transitions.create("transform"),
						}}
					/>
				</Button>
			)}
		</Root>
	);
};

export default RoomDetails;
