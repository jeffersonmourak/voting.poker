import { CssBaseline } from "@mui/material";

import { ThemeProvider } from "@mui/material/styles";
import theme from "./theme";

import "../globals.css";
import AnalyticsProvider from "@/features/analytics/AnalyticsProvider";

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
