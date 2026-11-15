import { describe, expect, it } from "vitest";
import { AVATAR_MAX_INPUT_BYTES, checkAvatarFile, coverCrop } from "./avatar";

describe("coverCrop", () => {
  it("crops the middle of a landscape image", () => {
    expect(coverCrop(400, 200)).toEqual({ sx: 100, sy: 0, side: 200 });
  });

  it("crops the middle of a portrait image", () => {
    expect(coverCrop(300, 500)).toEqual({ sx: 0, sy: 100, side: 300 });
  });

  it("keeps a square image whole", () => {
    expect(coverCrop(256, 256)).toEqual({ sx: 0, sy: 0, side: 256 });
  });
});

describe("checkAvatarFile", () => {
  it("accepts common photo types", () => {
    expect(checkAvatarFile({ type: "image/jpeg", size: 1000 })).toBeNull();
    expect(checkAvatarFile({ type: "image/png", size: 1000 })).toBeNull();
  });

  it("rejects other types, including SVG", () => {
    expect(checkAvatarFile({ type: "image/svg+xml", size: 1000 })).toMatch(/JPEG/);
    expect(checkAvatarFile({ type: "application/pdf", size: 1000 })).toMatch(/JPEG/);
  });

  it("rejects huge files", () => {
    expect(checkAvatarFile({ type: "image/jpeg", size: AVATAR_MAX_INPUT_BYTES + 1 })).toMatch(/15 MB/);
  });
});
