import { lazy, Suspense, Component } from "react";
import type { ReactNode } from "react";

// Error Boundary component
class ErrorBoundary extends Component<
	{ children: ReactNode },
	{ hasError: boolean; error?: Error }
> {
	constructor(props: { children: ReactNode }) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError(error: Error) {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: unknown) {
		console.error("Error caught by boundary:", error, errorInfo);
	}

	render() {
		if (this.state.hasError) {
			return (
				<div className="error-boundary">
					<h2>Something went wrong.</h2>
					<p>Please try refreshing the page.</p>
					{this.state.error && (
						<details>
							<summary>Error details</summary>
							<pre>{this.state.error.message}</pre>
						</details>
					)}
				</div>
			);
		}

		return this.props.children;
	}
}

const canUseDOM = !!(
	typeof window !== "undefined" &&
	window.document &&
	window.document.createElement
);

export function Session() {
	const LazySession = canUseDOM
		? lazy(() => import("./SessionPage"))
		: () => null;

	return (
		<ErrorBoundary>
			<Suspense fallback={<div>Loading...</div>}>
				<LazySession />
			</Suspense>
		</ErrorBoundary>
	);
}

export default Session;
