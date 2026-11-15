import { describe, expect, it } from "vitest";
import { looksLikeEmail, looksLikeLink, normalizeSocial } from "./fields";

describe("normalizeSocial", () => {
  it("turns usernames into profile links", () => {
    expect(normalizeSocial("github", "alexm")).toBe("https://github.com/alexm");
    expect(normalizeSocial("github", " @alex-m ")).toBe("https://github.com/alex-m");
    expect(normalizeSocial("linkedin", "alex-morgan")).toBe("https://www.linkedin.com/in/alex-morgan");
  });

  it("adds https to bare domains and keeps full links", () => {
    expect(normalizeSocial("github", "github.com/alexm")).toBe("https://github.com/alexm");
    expect(normalizeSocial("linkedin", "https://linkedin.com/in/a")).toBe("https://linkedin.com/in/a");
  });

  it("leaves other schemes for safeHref to reject at render time", () => {
    expect(normalizeSocial("github", "javascript:alert(1)")).toBe("javascript:alert(1)");
  });

  it("cleans emails and blanks", () => {
    expect(normalizeSocial("email", " mailto:a@example.com ")).toBe("a@example.com");
    expect(normalizeSocial("github", "   ")).toBe("");
  });
});

describe("looksLikeEmail", () => {
  it("accepts plausible emails and rejects obvious typos", () => {
    expect(looksLikeEmail("alex@example.com")).toBe(true);
    expect(looksLikeEmail("alex@example")).toBe(false);
    expect(looksLikeEmail("alex example.com")).toBe(false);
    expect(looksLikeEmail("alex@@example.com")).toBe(false);
  });
});

describe("looksLikeLink", () => {
  it("accepts links and bare domains, rejects junk", () => {
    expect(looksLikeLink("https://github.com/a")).toBe(true);
    expect(looksLikeLink("github.com/a")).toBe(true);
    expect(looksLikeLink("")).toBe(true);
    expect(looksLikeLink("not a link")).toBe(false);
    expect(looksLikeLink("javascript:alert(1)")).toBe(false);
  });
});
