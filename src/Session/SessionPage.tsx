import { RoomProvider, useRoom } from "../hooks/useRoom";
import { AvatarContext, AvatarProvider } from "../components/AvatarProvider";
import BasePage from "@/components/base-page";
import { useContext, useEffect, useMemo } from "react";
import { Box, Modal, styled } from "@mui/material";
import ModeratorModal from "@/components/ModeratorModal";
import RoomDetails from "@/components/RoomDetails";
import { VotingStates } from "@/lib/machines/voting/states";
import type { CoreClientState } from "@/lib/core";
import IdleStateComponent from "@/components/States/Idle";
import PoolStateComponent from "@/components/States/Pool";
import ResultStateComponent from "@/components/States/Result";
import posthog from "posthog-js";

const Root = styled(Box)(({ theme }) => ({
	display: "flex",
	gap: theme.spacing(4),
	flexDirection: "column",
	height: "100%",

	[theme.breakpoints.down("sm")]: {
		padding: theme.spacing(1),
		gap: theme.spacing(1),
	},
}));

function useRoomId() {
	if (typeof location === "undefined") {
		return;
	}

	const roomId = useMemo(() => {
		return location.href.split("/").pop();
	}, []);

	useEffect(() => {
		if (!roomId) {
			return;
		}

		posthog.group("Room", roomId);
	}, [roomId]);

	return roomId;
}

interface SwitchViewsProps {
	state: CoreClientState;
}

function SwitchViews({ state }: SwitchViewsProps) {
	switch (state.state) {
		case VotingStates.Idle:
			return <IdleStateComponent state={state} />;
		case VotingStates.Pool:
		case VotingStates.PoolVote:
			return <PoolStateComponent state={state} />;
		case VotingStates.PoolResult:
			return <ResultStateComponent state={state} />;
	}
}

function PageContent({ roomId }: { roomId: string }) {
	const room = useRoom();
	const { open: isAvatarOpen } = useContext(AvatarContext);

	return (
		<>
			<Modal open={!isAvatarOpen && room.state.moderatorEmpty}>
				<ModeratorModal />
			</Modal>
			<Root>
				<RoomDetails
					users={room.state.users}
					user={room.state.currentUser}
					roomId={roomId}
				/>
				<SwitchViews state={room.state} />
			</Root>
		</>
	);
}

export function SessionPage() {
	const roomId = useRoomId();

	if (!roomId) {
		throw new Error("No room ID found");
	}

	return (
		<BasePage>
			<RoomProvider roomId={roomId}>
				<AvatarProvider roomId={roomId}>
					<PageContent roomId={roomId} />
				</AvatarProvider>
			</RoomProvider>
		</BasePage>
	);
}

export default SessionPage;
