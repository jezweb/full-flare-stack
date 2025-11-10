import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock better-auth for testing
vi.mock("@/lib/auth-client", () => ({
	authClient: {
		signIn: {
			social: vi.fn(),
		},
		signOut: vi.fn(),
		useSession: vi.fn(),
	},
}));

// Mock environment variables
process.env.BETTER_AUTH_SECRET = "test-secret-key-for-testing-only";
process.env.BETTER_AUTH_URL = "http://localhost:3000";
