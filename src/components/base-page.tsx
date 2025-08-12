import Layout from "./layout";
import { Grid, Link } from "@mui/material";
import type { ReactNode } from "react";

interface BasePageProps {
	children: ReactNode;
}

const BasePage = ({ children }: BasePageProps) => {
	return (
		<Layout>
			<Grid
				container
				direction="column"
				sx={{
					width: "100%",
					minHeight: "100vh",
					flexWrap: "nowrap",
				}}
			>
				<Grid
					component="div"
					sx={{
						flex: 1,
					}}
				>
					{children}
				</Grid>

				<Grid
					component="div"
					sx={{
						lineHeight: 6,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						height: 64,
						overflow: "hidden",
					}}
				>
					Made with&nbsp;
					<span
						style={{
							color: "red",
							animation: "heart-beat 1s ease infinite",
						}}
					>
						♥︎
					</span>
					&nbsp;by&nbsp;
					<Link
						href="https://github.com/jeffersonmourak"
						target="_blank"
						sx={{
							color: "secondary.main",
						}}
					>
						jeffersonmourak
					</Link>
				</Grid>
			</Grid>
		</Layout>
	);
};

export default BasePage;
