import { describe, expect, it } from "vitest";
import { suggestUsername, validateUsername } from "./username";

describe("validateUsername", () => {
  it("accepts valid names and lowercases them", () => {
    expect(validateUsername("jane")).toEqual({ ok: true, username: "jane" });
    expect(validateUsername("  Jane-Doe42 ")).toEqual({ ok: true, username: "jane-doe42" });
    expect(validateUsername("a".repeat(30)).ok).toBe(true);
  });

  it("rejects bad lengths and characters", () => {
    for (const bad of ["", "ab", "a".repeat(31), "jane_doe", "jane.doe", "jané", "jane doe", "-jane", "jane-", "ja--ne"]) {
      expect(validateUsername(bad).ok, bad).toBe(false);
    }
  });

  it("rejects reserved names, including routes", () => {
    for (const name of ["dashboard", "sign-in", "API", "templates", "admin", "editor", "onboarding"]) {
      expect(validateUsername(name).ok, name).toBe(false);
    }
  });

  it("explains why", () => {
    const result = validateUsername("ab");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toMatch(/at least 3/);
  });
});

describe("suggestUsername", () => {
  it("slugs the name, accents removed", () => {
    expect(suggestUsername("José Núñez", "x@y.com")).toBe("jose-nunez");
    expect(suggestUsername("  Ada   Lovelace!! ", "")).toBe("ada-lovelace");
  });

  it("falls back to the email, and pads short or reserved names", () => {
    expect(suggestUsername("", "grace.hopper@navy.mil")).toBe("grace-hopper");
    expect(suggestUsername("Al", "")).toBe("al-resume");
    expect(suggestUsername("Admin", "")).toBe("admin-resume");
  });

  it("always returns a valid name or nothing", () => {
    expect(suggestUsername("", "")).toBe("");
    expect(suggestUsername("李雷", "")).toBe("");
    const long = suggestUsername("a".repeat(29) + " b", "");
    expect(validateUsername(long).ok).toBe(true);
  });
});
