/**
 * Centralized Error Logging
 *
 * Provides a unified interface for logging errors across the application.
 * Currently logs to console but designed to be easily extended for external
 * services like Sentry, LogFlare, or Cloudflare Analytics Engine.
 */

export interface ErrorContext {
	userId?: string;
	route?: string;
	action?: string;
	metadata?: Record<string, unknown>;
}

export interface LoggedError {
	message: string;
	digest?: string;
	stack?: string;
	context?: ErrorContext;
	timestamp: string;
}

/**
 * Logs an error with optional context
 *
 * @param error - The error object to log
 * @param context - Additional context about where/why the error occurred
 */
export function logError(
	error: Error & { digest?: string },
	context?: ErrorContext,
): void {
	const loggedError: LoggedError = {
		message: error.message,
		digest: error.digest,
		stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
		context,
		timestamp: new Date().toISOString(),
	};

	// Console logging (always enabled)
	console.error("[Error Logger]", loggedError);

	// TODO: Add external logging service here
	// Examples:
	// - Sentry: Sentry.captureException(error, { contexts: { custom: context } })
	// - Cloudflare Analytics: env.ANALYTICS.writeDataPoint({ ... })
	// - LogFlare: fetch('https://api.logflare.app/...', { ... })
}

/**
 * Categorizes errors into types for contextual messaging
 */
export enum ErrorType {
	NETWORK = "network",
	AUTHENTICATION = "authentication",
	AUTHORIZATION = "authorization",
	NOT_FOUND = "not_found",
	VALIDATION = "validation",
	DATABASE = "database",
	UNKNOWN = "unknown",
}

/**
 * Determines the error type based on error properties
 *
 * @param error - The error to categorize
 * @returns The error type
 */
export function categorizeError(error: Error): ErrorType {
	const message = error.message.toLowerCase();

	// Network errors
	if (
		message.includes("fetch") ||
		message.includes("network") ||
		message.includes("timeout")
	) {
		return ErrorType.NETWORK;
	}

	// Auth errors
	if (
		message.includes("unauthorized") ||
		message.includes("unauthenticated") ||
		message.includes("session")
	) {
		return ErrorType.AUTHENTICATION;
	}

	// Authorization errors
	if (message.includes("forbidden") || message.includes("permission")) {
		return ErrorType.AUTHORIZATION;
	}

	// Not found errors
	if (message.includes("not found") || message.includes("404")) {
		return ErrorType.NOT_FOUND;
	}

	// Validation errors
	if (message.includes("validation") || message.includes("invalid")) {
		return ErrorType.VALIDATION;
	}

	// Database errors
	if (
		message.includes("database") ||
		message.includes("sql") ||
		message.includes("query")
	) {
		return ErrorType.DATABASE;
	}

	return ErrorType.UNKNOWN;
}

/**
 * Gets a user-friendly error message based on error type
 *
 * @param errorType - The categorized error type
 * @returns A user-friendly error message
 */
export function getUserFriendlyMessage(errorType: ErrorType): string {
	switch (errorType) {
		case ErrorType.NETWORK:
			return "Unable to connect. Please check your internet connection and try again.";
		case ErrorType.AUTHENTICATION:
			return "Your session has expired. Please log in again.";
		case ErrorType.AUTHORIZATION:
			return "You don't have permission to access this resource.";
		case ErrorType.NOT_FOUND:
			return "The requested resource could not be found.";
		case ErrorType.VALIDATION:
			return "The provided data is invalid. Please check your input and try again.";
		case ErrorType.DATABASE:
			return "A database error occurred. Please try again later.";
		case ErrorType.UNKNOWN:
		default:
			return "Something went wrong. Please try again later.";
	}
}
