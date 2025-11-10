import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
	logError,
	categorizeError,
	getUserFriendlyMessage,
	ErrorType,
	type ErrorContext,
} from "../error-logger";

describe("error-logger", () => {
	let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
	});

	afterEach(() => {
		consoleErrorSpy.mockRestore();
	});

	describe("logError", () => {
		it("logs error with message", () => {
			const error = new Error("Test error");
			logError(error);

			expect(consoleErrorSpy).toHaveBeenCalledWith(
				"[Error Logger]",
				expect.objectContaining({
					message: "Test error",
					timestamp: expect.any(String),
				})
			);
		});

		it("includes context when provided", () => {
			const error = new Error("Test error");
			const context: ErrorContext = {
				userId: "user-123",
				route: "/api/todos",
				action: "create",
			};

			logError(error, context);

			expect(consoleErrorSpy).toHaveBeenCalledWith(
				"[Error Logger]",
				expect.objectContaining({
					message: "Test error",
					context,
				})
			);
		});

		it("includes stack trace in development", () => {
			const originalEnv = process.env.NODE_ENV;
			process.env.NODE_ENV = "development";

			const error = new Error("Test error");
			logError(error);

			expect(consoleErrorSpy).toHaveBeenCalledWith(
				"[Error Logger]",
				expect.objectContaining({
					stack: expect.any(String),
				})
			);

			process.env.NODE_ENV = originalEnv;
		});

		it("excludes stack trace in production", () => {
			const originalEnv = process.env.NODE_ENV;
			process.env.NODE_ENV = "production";

			const error = new Error("Test error");
			logError(error);

			expect(consoleErrorSpy).toHaveBeenCalledWith(
				"[Error Logger]",
				expect.objectContaining({
					stack: undefined,
				})
			);

			process.env.NODE_ENV = originalEnv;
		});

		it("includes digest when present", () => {
			const error = new Error("Test error") as Error & { digest?: string };
			error.digest = "abc123";

			logError(error);

			expect(consoleErrorSpy).toHaveBeenCalledWith(
				"[Error Logger]",
				expect.objectContaining({
					digest: "abc123",
				})
			);
		});
	});

	describe("categorizeError", () => {
		it("categorizes network errors", () => {
			expect(categorizeError(new Error("Fetch failed"))).toBe(ErrorType.NETWORK);
			expect(categorizeError(new Error("Network timeout"))).toBe(ErrorType.NETWORK);
		});

		it("categorizes authentication errors", () => {
			expect(categorizeError(new Error("Unauthorized access"))).toBe(
				ErrorType.AUTHENTICATION
			);
			expect(categorizeError(new Error("Session expired"))).toBe(
				ErrorType.AUTHENTICATION
			);
		});

		it("categorizes authorization errors", () => {
			expect(categorizeError(new Error("Forbidden resource"))).toBe(
				ErrorType.AUTHORIZATION
			);
			expect(categorizeError(new Error("No permission"))).toBe(
				ErrorType.AUTHORIZATION
			);
		});

		it("categorizes not found errors", () => {
			expect(categorizeError(new Error("Resource not found"))).toBe(
				ErrorType.NOT_FOUND
			);
			expect(categorizeError(new Error("404 error"))).toBe(ErrorType.NOT_FOUND);
		});

		it("categorizes validation errors", () => {
			expect(categorizeError(new Error("Validation failed"))).toBe(
				ErrorType.VALIDATION
			);
			expect(categorizeError(new Error("Invalid input"))).toBe(
				ErrorType.VALIDATION
			);
		});

		it("categorizes database errors", () => {
			expect(categorizeError(new Error("Database connection failed"))).toBe(
				ErrorType.DATABASE
			);
			expect(categorizeError(new Error("SQL syntax error"))).toBe(
				ErrorType.DATABASE
			);
		});

		it("returns UNKNOWN for unrecognized errors", () => {
			expect(categorizeError(new Error("Random error"))).toBe(ErrorType.UNKNOWN);
		});
	});

	describe("getUserFriendlyMessage", () => {
		it("returns appropriate message for each error type", () => {
			expect(getUserFriendlyMessage(ErrorType.NETWORK)).toContain(
				"check your internet connection"
			);
			expect(getUserFriendlyMessage(ErrorType.AUTHENTICATION)).toContain(
				"log in again"
			);
			expect(getUserFriendlyMessage(ErrorType.AUTHORIZATION)).toContain(
				"permission"
			);
			expect(getUserFriendlyMessage(ErrorType.NOT_FOUND)).toContain(
				"could not be found"
			);
			expect(getUserFriendlyMessage(ErrorType.VALIDATION)).toContain(
				"invalid"
			);
			expect(getUserFriendlyMessage(ErrorType.DATABASE)).toContain(
				"database error"
			);
			expect(getUserFriendlyMessage(ErrorType.UNKNOWN)).toContain(
				"Something went wrong"
			);
		});
	});
});
