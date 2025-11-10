import { describe, expect, it } from "vitest";
import { cn } from "../utils";

describe("cn utility", () => {
	it("merges class names correctly", () => {
		expect(cn("foo", "bar")).toBe("foo bar");
	});

	it("handles conditional classes", () => {
		expect(cn("foo", false && "bar", "baz")).toBe("foo baz");
		expect(cn("foo", true && "bar")).toBe("foo bar");
	});

	it("merges Tailwind classes correctly (deduplicates)", () => {
		expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
	});

	it("handles arrays and objects", () => {
		expect(cn(["foo", "bar"])).toBe("foo bar");
		expect(cn({ foo: true, bar: false })).toBe("foo");
	});

	it("handles undefined and null", () => {
		expect(cn("foo", undefined, "bar", null)).toBe("foo bar");
	});

	it("returns empty string for no arguments", () => {
		expect(cn()).toBe("");
	});
});
