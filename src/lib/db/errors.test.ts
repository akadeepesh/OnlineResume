import { describe, expect, it } from "vitest";
import { isUniqueViolation } from "./errors";

describe("isUniqueViolation", () => {
  it("finds the code directly or in the cause chain", () => {
    expect(isUniqueViolation({ code: "23505" })).toBe(true);
    expect(isUniqueViolation(Object.assign(new Error("Failed query"), { cause: { code: "23505" } }))).toBe(true);
  });

  it("ignores other errors", () => {
    expect(isUniqueViolation(new Error("boom"))).toBe(false);
    expect(isUniqueViolation({ code: "23503" })).toBe(false);
    expect(isUniqueViolation(null)).toBe(false);
    expect(isUniqueViolation("23505")).toBe(false);
  });
});
