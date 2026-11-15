import { describe, expect, it } from "vitest";
import { blankResume } from "@/lib/resume/draft";
import { sampleResume } from "@/lib/resume/sample";
import { isReadyMessage, readUpdateMessage, withPlaceholderName } from "./preview-channel";

describe("preview channel", () => {
  it("recognises the ready message", () => {
    expect(isReadyMessage({ type: "preview:ready" })).toBe(true);
    expect(isReadyMessage({ type: "other" })).toBe(false);
    expect(isReadyMessage(null)).toBe(false);
  });

  it("reads a valid update", () => {
    const msg = { type: "preview:update", resume: sampleResume, template: "bento" };
    expect(readUpdateMessage(msg)).toEqual({ resume: sampleResume, template: "bento" });
  });

  it("accepts a draft with an empty name", () => {
    const msg = { type: "preview:update", resume: blankResume(), template: "classic" };
    expect(readUpdateMessage(msg)?.resume).toEqual(blankResume());
  });

  it("rejects unknown templates, bad resumes and other messages", () => {
    expect(readUpdateMessage({ type: "preview:update", resume: sampleResume, template: "x" })).toBeNull();
    expect(readUpdateMessage({ type: "preview:update", resume: { nope: 1 }, template: "classic" })).toBeNull();
    expect(readUpdateMessage({ type: "something-else" })).toBeNull();
    expect(readUpdateMessage("preview:update")).toBeNull();
  });

  it("fills a placeholder name only when the name is blank", () => {
    expect(withPlaceholderName(blankResume()).profile.name).toBe("Your Name");
    expect(withPlaceholderName(sampleResume)).toBe(sampleResume);
  });
});
