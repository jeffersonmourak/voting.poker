'use client';

import React, { useState } from "react";

import { useRoom } from "../hooks/useRoom";
import { AvatarEditorModal } from "@/components/AvatarEditorModal";
import { identify } from "@/helpers/analytics";

interface IAvatarContextData {
	open: boolean;
}

interface IAvatarContext extends IAvatarContextData {
	update: (value: Partial<IAvatarContextData>) => void;
}

export const AvatarContext = React.createContext<IAvatarContext>({
	open: true,
	update: () => undefined,
});

interface AvatarProviderProps {
	children: React.ReactNode;
	roomId: string;
}

export const AvatarProvider = ({ children }: AvatarProviderProps) => {
	const [{ open }, updateConfig] = useState<IAvatarContextData>({
		open: true,
	});

	const { state, updateUser } = useRoom();

	const update = (value: Partial<IAvatarContextData>) => {
		updateConfig((v) => ({ ...v, ...value }));
	};

	return (
		<AvatarContext.Provider
			value={{
				open,
				update,
			}}
		>
			{children}
			{state.currentUser && (
				<AvatarEditorModal
					open={open}
					setOpen={(value) => update({ open: value })}
					user={state.currentUser}
					onChange={(value) => {
						const newUser = {
							...value,
							moderator: state.currentUser?.moderator ?? false,
						};
						identify(newUser);
						updateUser(newUser);
					}}
				/>
			)}
		</AvatarContext.Provider>
	);
};
