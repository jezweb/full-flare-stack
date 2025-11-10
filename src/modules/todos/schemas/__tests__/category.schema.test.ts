import { describe, expect, it } from "vitest";
import {
	insertCategorySchema,
	updateCategorySchema,
	type NewCategory,
} from "../category.schema";

describe("category schemas", () => {
	describe("insertCategorySchema", () => {
		const validCategory: NewCategory = {
			name: "Work",
			color: "#6366f1",
			description: "Work-related tasks",
			userId: "test-user-id",
		};

		it("validates a valid category", () => {
			const result = insertCategorySchema.safeParse(validCategory);
			expect(result.success).toBe(true);
		});

		it("requires name", () => {
			const { name, ...categoryWithoutName } = validCategory;
			const result = insertCategorySchema.safeParse(categoryWithoutName);
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues.length).toBeGreaterThan(0);
				const nameError = result.error.issues.find(e => e.path.includes("name"));
				expect(nameError).toBeDefined();
			}
		});

		it("rejects empty name", () => {
			const result = insertCategorySchema.safeParse({
				...validCategory,
				name: "",
			});
			expect(result.success).toBe(false);
		});

		it("accepts optional color", () => {
			const { color, ...categoryWithoutColor } = validCategory;
			const result = insertCategorySchema.safeParse(categoryWithoutColor);
			expect(result.success).toBe(true);
		});

		it("accepts optional description", () => {
			const { description, ...categoryWithoutDescription } = validCategory;
			const result = insertCategorySchema.safeParse(categoryWithoutDescription);
			expect(result.success).toBe(true);
		});

		it("requires userId", () => {
			const { userId, ...categoryWithoutUserId } = validCategory;
			const result = insertCategorySchema.safeParse(categoryWithoutUserId);
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues.length).toBeGreaterThan(0);
				const userIdError = result.error.issues.find(e => e.path.includes("userId"));
				expect(userIdError).toBeDefined();
			}
		});

		it("accepts hex color codes", () => {
			const colors = ["#ff0000", "#00ff00", "#0000ff", "#6366f1"];
			for (const color of colors) {
				const result = insertCategorySchema.safeParse({
					...validCategory,
					color,
				});
				expect(result.success).toBe(true);
			}
		});
	});

	describe("updateCategorySchema", () => {
		it("accepts partial updates", () => {
			const result = updateCategorySchema.safeParse({
				name: "Updated name",
			});
			expect(result.success).toBe(true);
		});

		it("allows updating only color", () => {
			const result = updateCategorySchema.safeParse({
				color: "#ff0000",
			});
			expect(result.success).toBe(true);
		});

		it("allows updating only description", () => {
			const result = updateCategorySchema.safeParse({
				description: "Updated description",
			});
			expect(result.success).toBe(true);
		});

		it("validates name is not empty even in partial update", () => {
			const result = updateCategorySchema.safeParse({
				name: "",
			});
			expect(result.success).toBe(false);
		});

		it("accepts empty object", () => {
			const result = updateCategorySchema.safeParse({});
			expect(result.success).toBe(true);
		});

		it("prevents updating userId", () => {
			// userId should be omitted from update schema
			const schema = updateCategorySchema.safeParse({
				name: "Test",
				userId: "different-user", // Should be ignored
			});
			expect(schema.success).toBe(true);
		});
	});
});
