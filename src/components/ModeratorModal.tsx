import { Button, Container, Paper, styled, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { identify } from "../helpers/highlight";
import { useRoom } from "@/hooks/useRoom";

const Root = styled(Box)(({ theme }) => ({
	width: "100%",
	height: "100vh",
	display: "flex",
	justifyContent: "center",
	alignItems: "center",
}));

const ModalContent = styled(Container)(({ theme }) => ({
	display: "flex",
	flexDirection: "column",
	alignItems: "center",
	justifyContent: "center",
	padding: theme.spacing(6, 4),
	gap: theme.spacing(4),
}));
const ModeratorModal = () => {
	const room = useRoom();

	return (
		<Root>
			<Paper>
				<ModalContent maxWidth="sm">
					<Typography variant="h5" align="center">
						Well, seems like the moderator left, but you can still be the
						moderator!
					</Typography>
					<Button
						color="secondary"
						variant="contained"
						onClick={() => {
							const user = room.state.currentUser;

							if (!user) {
								return;
							}
							identify({ ...user, moderator: true });
							room.updateUser({ ...user, moderator: true });
						}}
					>
						Be the moderator
					</Button>
				</ModalContent>
			</Paper>
		</Root>
	);
};

export default ModeratorModal;
