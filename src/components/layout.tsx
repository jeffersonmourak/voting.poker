import { CssBaseline } from "@mui/material";

import { ThemeProvider } from "@mui/material/styles";
import theme from "../theme";

import "../globals.css";
import AnalyticsProvider from "./AnalyticsProvider";

export const metadata = {
	title: "Voting Poker",
	description:
		"Voting Poker is an open-source, real-time, collaborative voting tool for remote teams.",
	openGraph: {
		title: "Voting Poker",
		type: "website",
		url: "https://voting.poker",
		siteName: "Voting Poker",
		description:
			"Voting Poker is an open-source, real-time, collaborative voting tool for remote teams.",
		images: [
			{
				url: "https://voting.poker/OG/OpenGraphFigure.png",
				width: 800,
				height: 400,
				alt: "Voting Poker",
			},
		],
	},
};

export const viewport = {
	themeColor: "black",
	initialScale: 1,
	width: "device-width",
};

// const MontFont = localFont({
// 	src: [
// 		{
// 			path: "../../public/fonts/Mont/MontBlack_normal_normal.woff2",
// 			weight: "900",
// 			style: "normal",
// 		},
// 		{
// 			path: "../../public/fonts/Mont/MontSemiBold_normal_normal.woff2",
// 			weight: "600",
// 			style: "normal",
// 		},
// 		{
// 			path: "../../public/fonts/Mont/MontRegular_normal_normal.woff2",
// 			weight: "500",
// 			style: "normal",
// 		},
// 	],
// 	display: "swap",
// 	variable: "--mont",
// });

export default function Layout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<ThemeProvider theme={theme}>
			<AnalyticsProvider>
				<CssBaseline />
				{children}
			</AnalyticsProvider>
		</ThemeProvider>
	);
}
