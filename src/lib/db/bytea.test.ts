import { describe, expect, it } from "vitest";
import { fromPgHex, toPgHex } from "./bytea";

describe("bytea conversion", () => {
  it("writes bytes as a Postgres hex literal", () => {
    expect(toPgHex(new Uint8Array([72, 105, 0, 255]))).toBe("\\x486900ff");
    expect(toPgHex(new Uint8Array())).toBe("\\x");
  });

  it("reads them back unchanged", () => {
    const bytes = new Uint8Array(256).map((_, i) => i);
    expect(fromPgHex(toPgHex(bytes))).toEqual(bytes);
    expect(fromPgHex("\\x4869")).toEqual(new Uint8Array([72, 105]));
  });

  it("passes raw bytes through (other drivers return them as-is)", () => {
    const bytes = new Uint8Array([1, 2, 3]);
    expect(fromPgHex(bytes)).toBe(bytes);
  });

  it("rejects values that aren't hex bytea", () => {
    expect(() => fromPgHex("hello")).toThrow();
    expect(() => fromPgHex("\\x123")).toThrow();
    expect(() => fromPgHex("\\xzz")).toThrow();
  });
});
