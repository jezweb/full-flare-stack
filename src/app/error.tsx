"use client";

/**
 * Root Error Boundary
 *
 * Catches all errors in the application except those in the root layout itself.
 * Provides contextual error messages and recovery options.
 *
 * Next.js automatically wraps this component around route segments.
 */

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, Home, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
	logError,
	categorizeError,
	getUserFriendlyMessage,
	ErrorType,
} from "@/lib/error-logger";

interface ErrorProps {
	error: Error & { digest?: string };
	reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
	useEffect(() => {
		// Log error on mount
		logError(error, {
			route: window.location.pathname,
			action: "error_boundary_triggered",
		});
	}, [error]);

	const errorType = categorizeError(error);
	const userMessage = getUserFriendlyMessage(errorType);

	// Special handling for auth errors - redirect to login
	const isAuthError =
		errorType === ErrorType.AUTHENTICATION ||
		errorType === ErrorType.AUTHORIZATION;

	return (
		<div className="flex min-h-screen items-center justify-center p-4">
			<Card className="w-full max-w-lg p-6">
				<Alert variant="destructive" className="mb-6">
					<AlertCircle className="h-4 w-4" />
					<AlertTitle className="text-lg font-semibold">
						{errorType === ErrorType.AUTHENTICATION
							? "Session Expired"
							: errorType === ErrorType.AUTHORIZATION
								? "Access Denied"
								: "Something Went Wrong"}
					</AlertTitle>
					<AlertDescription className="mt-2">{userMessage}</AlertDescription>
				</Alert>

				{/* Show error details in development */}
				{process.env.NODE_ENV === "development" && (
					<div className="mb-6 rounded-lg bg-muted p-4">
						<p className="mb-2 text-sm font-medium text-muted-foreground">
							Development Details:
						</p>
						<p className="text-sm font-mono text-muted-foreground break-all">
							{error.message}
						</p>
						{error.digest && (
							<p className="mt-2 text-xs text-muted-foreground">
								Error ID: {error.digest}
							</p>
						)}
					</div>
				)}

				{/* Action buttons */}
				<div className="flex flex-col gap-3 sm:flex-row">
					{isAuthError ? (
						<Button asChild className="flex-1">
							<Link href="/login">Go to Login</Link>
						</Button>
					) : (
						<Button onClick={reset} className="flex-1">
							<RefreshCw className="mr-2 h-4 w-4" />
							Try Again
						</Button>
					)}

					<Button asChild variant="outline" className="flex-1">
						<Link href="/dashboard">
							<Home className="mr-2 h-4 w-4" />
							Go to Dashboard
						</Link>
					</Button>
				</div>

				{/* Additional help text */}
				<p className="mt-6 text-center text-sm text-muted-foreground">
					If this problem persists, please contact support.
				</p>
			</Card>
		</div>
	);
}
