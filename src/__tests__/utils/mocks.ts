import { vi } from "vitest";
import type { Session, User } from "better-auth/types";

/**
 * Mock user for testing
 */
export const mockUser: User = {
	id: "test-user-id",
	email: "test@example.com",
	name: "Test User",
	image: null,
	createdAt: new Date(),
	updatedAt: new Date(),
	emailVerified: false,
};

/**
 * Mock session for testing
 */
export const mockSession: Session = {
	id: "test-session-id",
	userId: mockUser.id,
	expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
	ipAddress: "127.0.0.1",
	userAgent: "test-agent",
	token: "test-token",
	createdAt: new Date(),
	updatedAt: new Date(),
};

/**
 * Mock auth() function that returns a session
 */
export function mockAuth(options?: { session?: Session | null; user?: User | null }) {
	return vi.fn(() =>
		Promise.resolve({
			session: options?.session ?? mockSession,
			user: options?.user ?? mockUser,
		})
	);
}

/**
 * Mock auth() function that returns null (unauthenticated)
 */
export function mockAuthUnauthenticated() {
	return vi.fn(() =>
		Promise.resolve({
			session: null,
			user: null,
		})
	);
}

/**
 * Mock D1 database for testing
 */
export function mockD1Database() {
	return {
		prepare: vi.fn(() => ({
			bind: vi.fn().mockReturnThis(),
			first: vi.fn(),
			all: vi.fn(),
			run: vi.fn(),
		})),
		batch: vi.fn(),
		exec: vi.fn(),
	};
}

/**
 * Mock R2 bucket for testing
 */
export function mockR2Bucket() {
	return {
		put: vi.fn(() => Promise.resolve()),
		get: vi.fn(),
		delete: vi.fn(() => Promise.resolve()),
		head: vi.fn(),
		list: vi.fn(),
	};
}

/**
 * Mock Cloudflare request context
 */
export function mockCloudflareContext() {
	return {
		DB: mockD1Database(),
		R2_BUCKET: mockR2Bucket(),
		ANALYTICS: {},
	};
}

/**
 * Mock form data
 */
export function createMockFormData(data: Record<string, string | File>): FormData {
	const formData = new FormData();
	for (const [key, value] of Object.entries(data)) {
		formData.append(key, value);
	}
	return formData;
}
