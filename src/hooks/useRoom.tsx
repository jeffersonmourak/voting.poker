import { createContext, useContext } from "react";
import { useCoreClientState } from "./useCoreClientState";
import type { CoreClientState, User } from "@/lib/core";
import { VotingEvents } from "@/lib/machines/voting/events";

interface RoomContext {
	state: CoreClientState;
	updateUser: (user: User) => void;
	roomId: string;
}

const RoomContext = createContext<RoomContext | null>(null);

export function useRoom() {
	const context = useContext(RoomContext);

	if (!context) {
		throw new Error("useRoom must be used within a RoomProvider");
	}

	return context;
}

interface RoomProviderProps {
	children: React.ReactNode;
	roomId: string;
}

export const RoomProvider: React.FC<RoomProviderProps> = ({
	children,
	roomId,
}) => {
	const { state, client, publish } = useCoreClientState(roomId);
	return (
		<RoomContext.Provider
			value={{
				state,
				roomId,
				updateUser: (payload: User) => {
					if (!state.currentUser) {
						return;
					}

					publish({
						type: VotingEvents.UpdateUser,
						payload,
						createdBy: state.currentUser.name,
						id: state.currentUser.id,
					});
					client.update(payload);
				},
			}}
		>
			{children}
		</RoomContext.Provider>
	);
};
