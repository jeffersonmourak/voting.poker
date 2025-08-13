import { darken, styled } from "@mui/system";

import { useTheme } from "@mui/material";
import AppLogo from "../../assets/logo.svg" with { type: "text" };

import { useVisibleSection } from "./hooks/useVisibleSection";

const Root = styled("div")({
	display: "flex",
	alignItems: "center",
	gap: 8,
});

const AppTitle = styled("h1")(({ theme }) => ({
	color: theme.palette.common.white,
	fontSize: "28px !important",
	fontStyle: "normal",
	fontWeight: 900,
	lineHeight: "normal",
	letterSpacing: -0.56,

	[theme.breakpoints.down("md")]: {
		fontSize: "16px !important",
	},
}));

const Logo = styled("div")(({ theme }) => ({
	width: 37,
	height: 37,

	[theme.breakpoints.down("md")]: {
		width: 24,
		height: 24,
	},
}));

export default function AppIdentification() {
	const { visibleSection } = useVisibleSection(64);
	const isDark = visibleSection > 0;

	const theme = useTheme();
	const manifestBackgroundColor = theme.palette.augmentColor({
		color: { main: "#F8C3A9" },
	});

	return (
		<Root>
			<Logo
				// biome-ignore lint/security/noDangerouslySetInnerHtml: injecting logo svg for static rendering
				dangerouslySetInnerHTML={{ __html: AppLogo }}
				sx={
					isDark
						? {
								color: darken(manifestBackgroundColor.dark, 0.5),
							}
						: undefined
				}
			/>
			<AppTitle
				sx={
					isDark
						? {
								color: darken(manifestBackgroundColor.dark, 0.5),
							}
						: undefined
				}
			>
				Voting Poker
			</AppTitle>
		</Root>
	);
}
