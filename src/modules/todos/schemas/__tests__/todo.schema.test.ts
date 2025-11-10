import { describe, expect, it } from "vitest";
import {
	insertTodoSchema,
	updateTodoSchema,
	type NewTodo,
} from "../todo.schema";
import { TodoStatus, TodoPriority } from "../../models/todo.enum";

describe("todo schemas", () => {
	describe("insertTodoSchema", () => {
		const validTodo: NewTodo = {
			title: "Test Todo",
			description: "Test description",
			userId: "test-user-id",
			status: TodoStatus.PENDING,
			priority: TodoPriority.MEDIUM,
		};

		it("validates a valid todo", () => {
			const result = insertTodoSchema.safeParse(validTodo);
			expect(result.success).toBe(true);
		});

		it("rejects title shorter than 3 characters", () => {
			const result = insertTodoSchema.safeParse({
				...validTodo,
				title: "AB",
			});
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues.length).toBeGreaterThan(0);
				const titleError = result.error.issues.find(e => e.path.includes("title"));
				expect(titleError).toBeDefined();
				// Message could be either "Title is required" or contain "3 characters"
				expect(titleError?.message).toBeTruthy();
			}
		});

		it("rejects title longer than 255 characters", () => {
			const result = insertTodoSchema.safeParse({
				...validTodo,
				title: "A".repeat(256),
			});
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues.length).toBeGreaterThan(0);
				const titleError = result.error.issues.find(e => e.path.includes("title"));
				expect(titleError).toBeDefined();
				expect(titleError?.message).toContain("255");
			}
		});

		it("rejects description longer than 1000 characters", () => {
			const result = insertTodoSchema.safeParse({
				...validTodo,
				description: "A".repeat(1001),
			});
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues.length).toBeGreaterThan(0);
				const descError = result.error.issues.find(e => e.path.includes("description"));
				expect(descError).toBeDefined();
				expect(descError?.message).toContain("1000");
			}
		});

		it("accepts optional description", () => {
			const result = insertTodoSchema.safeParse({
				...validTodo,
				description: undefined,
			});
			expect(result.success).toBe(true);
		});

		it("rejects invalid status", () => {
			const result = insertTodoSchema.safeParse({
				...validTodo,
				status: "invalid-status" as any,
			});
			expect(result.success).toBe(false);
		});

		it("rejects invalid priority", () => {
			const result = insertTodoSchema.safeParse({
				...validTodo,
				priority: "invalid-priority" as any,
			});
			expect(result.success).toBe(false);
		});

		it("accepts valid statuses", () => {
			const statuses = Object.values(TodoStatus);
			for (const status of statuses) {
				const result = insertTodoSchema.safeParse({
					...validTodo,
					status,
				});
				expect(result.success).toBe(true);
			}
		});

		it("accepts valid priorities", () => {
			const priorities = Object.values(TodoPriority);
			for (const priority of priorities) {
				const result = insertTodoSchema.safeParse({
					...validTodo,
					priority,
				});
				expect(result.success).toBe(true);
			}
		});

		it("rejects invalid image URL", () => {
			const result = insertTodoSchema.safeParse({
				...validTodo,
				imageUrl: "not-a-url",
			});
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues.length).toBeGreaterThan(0);
				const imageError = result.error.issues.find(e => e.path.includes("imageUrl"));
				expect(imageError).toBeDefined();
			}
		});

		it("accepts valid image URL", () => {
			const result = insertTodoSchema.safeParse({
				...validTodo,
				imageUrl: "https://example.com/image.png",
			});
			expect(result.success).toBe(true);
		});

		it("accepts empty string for optional fields", () => {
			const result = insertTodoSchema.safeParse({
				...validTodo,
				imageUrl: "",
				imageAlt: "",
				dueDate: "",
			});
			expect(result.success).toBe(true);
		});

		it("accepts optional categoryId", () => {
			const result = insertTodoSchema.safeParse({
				...validTodo,
				categoryId: 123,
			});
			expect(result.success).toBe(true);
		});

		it("requires userId", () => {
			const { userId, ...todoWithoutUserId } = validTodo;
			const result = insertTodoSchema.safeParse(todoWithoutUserId);
			expect(result.success).toBe(false);
		});
	});

	describe("updateTodoSchema", () => {
		it("accepts partial updates", () => {
			const result = updateTodoSchema.safeParse({
				title: "Updated title",
			});
			expect(result.success).toBe(true);
		});

		it("allows updating only description", () => {
			const result = updateTodoSchema.safeParse({
				description: "Updated description",
			});
			expect(result.success).toBe(true);
		});

		it("allows updating only status", () => {
			const result = updateTodoSchema.safeParse({
				status: TodoStatus.COMPLETED,
			});
			expect(result.success).toBe(true);
		});

		it("allows updating only priority", () => {
			const result = updateTodoSchema.safeParse({
				priority: TodoPriority.HIGH,
			});
			expect(result.success).toBe(true);
		});

		it("validates title length even in partial update", () => {
			const result = updateTodoSchema.safeParse({
				title: "AB",
			});
			expect(result.success).toBe(false);
		});

		it("accepts empty object", () => {
			const result = updateTodoSchema.safeParse({});
			expect(result.success).toBe(true);
		});
	});
});
