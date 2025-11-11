"use client";

/**
 * Global Error Handler (Failsafe)
 *
 * Catches errors in the root layout itself. This is a last-resort error boundary
 * that replaces the entire app when the root layout fails.
 *
 * IMPORTANT: Must include <html> and <body> tags since it replaces root layout.
 * Keep dependencies minimal - theme provider and other context may have failed.
 */

import { useEffect } from "react";

interface GlobalErrorProps {
	error: Error & { digest?: string };
	reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
	useEffect(() => {
		// Log to console (no external dependencies)
		console.error("[Global Error]", {
			message: error.message,
			digest: error.digest,
			timestamp: new Date().toISOString(),
		});
	}, [error]);

	return (
		<html lang="en">
			<body>
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						justifyContent: "center",
						minHeight: "100vh",
						padding: "1rem",
						fontFamily:
							'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
						backgroundColor: "#0a0a0a",
						color: "#fafafa",
					}}
				>
					<div
						style={{
							maxWidth: "500px",
							width: "100%",
							padding: "2rem",
							backgroundColor: "#1a1a1a",
							borderRadius: "0.5rem",
							border: "1px solid #2a2a2a",
						}}
					>
						<h1
							style={{
								fontSize: "1.5rem",
								fontWeight: "600",
								marginBottom: "1rem",
								color: "#ef4444",
							}}
						>
							Application Error
						</h1>

						<p
							style={{
								marginBottom: "1.5rem",
								color: "#a1a1aa",
								lineHeight: "1.6",
							}}
						>
							A critical error occurred. This usually means something went wrong
							with the application's core infrastructure.
						</p>

						{process.env.NODE_ENV === "development" && (
							<div
								style={{
									padding: "1rem",
									backgroundColor: "#0a0a0a",
									borderRadius: "0.25rem",
									marginBottom: "1.5rem",
									fontSize: "0.875rem",
									fontFamily: "monospace",
									color: "#71717a",
									wordBreak: "break-all",
								}}
							>
								<p style={{ marginBottom: "0.5rem", color: "#a1a1aa" }}>
									Development Details:
								</p>
								{error.message}
								{error.digest && (
									<p style={{ marginTop: "0.5rem", fontSize: "0.75rem" }}>
										Error ID: {error.digest}
									</p>
								)}
							</div>
						)}

						<div
							style={{
								display: "flex",
								gap: "0.75rem",
								flexWrap: "wrap",
							}}
						>
							<button
								onClick={reset}
								style={{
									flex: "1",
									padding: "0.5rem 1rem",
									backgroundColor: "#fafafa",
									color: "#0a0a0a",
									border: "none",
									borderRadius: "0.375rem",
									fontWeight: "500",
									cursor: "pointer",
									fontSize: "0.875rem",
								}}
								onMouseOver={(e) => {
									e.currentTarget.style.backgroundColor = "#e4e4e7";
								}}
								onMouseOut={(e) => {
									e.currentTarget.style.backgroundColor = "#fafafa";
								}}
							>
								Try Again
							</button>

							<button
								onClick={() => (window.location.href = "/")}
								style={{
									flex: "1",
									padding: "0.5rem 1rem",
									backgroundColor: "#2a2a2a",
									color: "#fafafa",
									border: "1px solid #3a3a3a",
									borderRadius: "0.375rem",
									fontWeight: "500",
									cursor: "pointer",
									fontSize: "0.875rem",
								}}
								onMouseOver={(e) => {
									e.currentTarget.style.backgroundColor = "#3a3a3a";
								}}
								onMouseOut={(e) => {
									e.currentTarget.style.backgroundColor = "#2a2a2a";
								}}
							>
								Go Home
							</button>
						</div>

						<p
							style={{
								marginTop: "1.5rem",
								textAlign: "center",
								fontSize: "0.875rem",
								color: "#71717a",
							}}
						>
							If this problem persists, please contact support.
						</p>
					</div>
				</div>
			</body>
		</html>
	);
}
