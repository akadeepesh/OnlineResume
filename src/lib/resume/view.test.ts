import { describe, expect, it } from "vitest";
import { displayUrl, firstName, has, initials, joinParts, safeHref, safeImageSrc, socialLinks, visibleResume } from "./view";
import { sampleResume } from "./sample";
import { blankResume } from "./draft";

describe("has", () => {
  it("treats missing and blank strings as absent", () => {
    expect(has(undefined)).toBe(false);
    expect(has(null)).toBe(false);
    expect(has("")).toBe(false);
    expect(has("   ")).toBe(false);
    expect(has("x")).toBe(true);
  });
});

describe("joinParts", () => {
  it("skips missing parts so no separator dangles", () => {
    expect(joinParts(["Acme", undefined, "Remote"])).toBe("Acme · Remote");
    expect(joinParts([undefined, "Remote"])).toBe("Remote");
    expect(joinParts(["", "  "])).toBe("");
    expect(joinParts(["a", "b"], ", ")).toBe("a, b");
  });
});

describe("initials", () => {
  it("uses first and last word", () => {
    expect(initials("Alex Morgan")).toBe("AM");
    expect(initials("Mary Jane Watson")).toBe("MW");
    expect(initials("  cher ")).toBe("C");
  });
});

describe("firstName", () => {
  it("returns the first word", () => {
    expect(firstName(" Alex Morgan")).toBe("Alex");
    expect(firstName("Cher")).toBe("Cher");
  });
});

describe("displayUrl", () => {
  it("strips protocol, www and trailing slash", () => {
    expect(displayUrl("https://www.linkedin.com/in/example/")).toBe("linkedin.com/in/example");
  });
});

describe("socialLinks", () => {
  it("returns only filled-in links, with mailto for email", () => {
    expect(socialLinks({ email: " a@example.com ", github: "" })).toEqual([
      { kind: "email", label: "Email", href: "mailto:a@example.com", display: "a@example.com" },
    ]);
    expect(socialLinks({})).toEqual([]);
    expect(
      socialLinks({ github: "https://github.com/example", email: "a@example.com" }, [
        "email",
        "github",
      ]).map((l) => l.kind)
    ).toEqual(["email", "github"]);
    expect(socialLinks(undefined)).toEqual([]);
  });
});

describe("safeHref", () => {
  it("keeps http(s), mailto and same-site links", () => {
    expect(safeHref(" https://example.com/a ")).toBe("https://example.com/a");
    expect(safeHref("HTTP://example.com")).toBe("HTTP://example.com");
    expect(safeHref("mailto:a@example.com")).toBe("mailto:a@example.com");
    expect(safeHref("/resume.pdf")).toBe("/resume.pdf");
  });

  it("adds https to bare domains and protocol-relative links", () => {
    expect(safeHref("github.com/alex")).toBe("https://github.com/alex");
    expect(safeHref("//example.com")).toBe("https://example.com");
  });

  it("drops dangerous schemes and blanks", () => {
    expect(safeHref("javascript:alert(1)")).toBeUndefined();
    expect(safeHref("  JavaScript:alert(1)")).toBeUndefined();
    expect(safeHref("data:text/html,<script>")).toBeUndefined();
    expect(safeHref("vbscript:x")).toBeUndefined();
    expect(safeHref("   ")).toBeUndefined();
    expect(safeHref(undefined)).toBeUndefined();
  });
});

describe("socialLinks with typed input", () => {
  it("fixes bare domains and skips unsafe links", () => {
    expect(socialLinks({ github: "github.com/alex", linkedin: "javascript:alert(1)" })).toEqual([
      { kind: "github", label: "GitHub", href: "https://github.com/alex", display: "github.com/alex" },
    ]);
  });

  it("does not double the mailto prefix", () => {
    expect(socialLinks({ email: "mailto:a@example.com" })[0].href).toBe("mailto:a@example.com");
  });
});

describe("visibleResume", () => {
  it("leaves a complete resume unchanged", () => {
    expect(visibleResume(sampleResume)).toEqual(sampleResume);
  });

  it("drops items with nothing typed into them", () => {
    const resume = {
      ...blankResume(),
      experience: [{ title: " ", company: "", responsibilities: [""], skills: [" "] }],
      skills: [{ name: "", icon: "code" as const, repos: [] }],
      certifications: [{ name: "", icon: "file" as const }],
      education: [{ institution: "" }],
    };
    const visible = visibleResume(resume);
    expect(visible.experience).toEqual([]);
    expect(visible.skills).toEqual([]);
    expect(visible.certifications).toEqual([]);
    expect(visible.education).toEqual([]);
  });

  it("keeps half-written items but strips their blank bullets and tags", () => {
    const resume = {
      ...blankResume(),
      experience: [{ title: "", company: "Acme", responsibilities: ["Did things", "  "], skills: ["", "Go"] }],
    };
    expect(visibleResume(resume).experience).toEqual([
      { title: "", company: "Acme", responsibilities: ["Did things"], skills: ["Go"] },
    ]);
  });
});

describe("safeImageSrc", () => {
  it("keeps uploaded photos, site paths and http(s) images", () => {
    expect(safeImageSrc("data:image/jpeg;base64,/9j/4AAQ")).toBe("data:image/jpeg;base64,/9j/4AAQ");
    expect(safeImageSrc("/avatar.png")).toBe("/avatar.png");
    expect(safeImageSrc("https://example.com/me.png")).toBe("https://example.com/me.png");
  });

  it("drops scripts, SVG data URLs and protocol-relative links", () => {
    expect(safeImageSrc("javascript:alert(1)")).toBeUndefined();
    expect(safeImageSrc("data:image/svg+xml;base64,PHN2Zz4=")).toBeUndefined();
    expect(safeImageSrc("data:text/html,<script>")).toBeUndefined();
    expect(safeImageSrc("//evil.example/x.png")).toBeUndefined();
    expect(safeImageSrc("  ")).toBeUndefined();
  });
});
