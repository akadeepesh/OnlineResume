import { describe, expect, it } from "vitest";
import { authErrorMessage, GENERIC_AUTH_ERROR } from "./messages";
import { enabledProviders, socialProviders } from "./providers";
import { authPageHref, DEFAULT_AFTER_SIGN_IN, safeNext } from "./redirect";

describe("social providers", () => {
  it("turns on a provider only when both id and secret are set", () => {
    expect(socialProviders({})).toEqual({});
    expect(socialProviders({ GOOGLE_CLIENT_ID: "id" })).toEqual({});
    expect(socialProviders({ GITHUB_CLIENT_ID: "a", GITHUB_CLIENT_SECRET: "b" })).toEqual({
      github: { clientId: "a", clientSecret: "b" },
    });
  });

  it("lists enabled providers in display order", () => {
    expect(
      enabledProviders({
        GITHUB_CLIENT_ID: "a",
        GITHUB_CLIENT_SECRET: "b",
        GOOGLE_CLIENT_ID: "c",
        GOOGLE_CLIENT_SECRET: "d",
      }),
    ).toEqual(["google", "github"]);
  });
});

describe("safeNext", () => {
  it("keeps same-site paths", () => {
    expect(safeNext("/dashboard")).toBe("/dashboard");
    expect(safeNext("/editor?x=1#top")).toBe("/editor?x=1#top");
    expect(safeNext(["/a", "/b"])).toBe("/a");
  });

  it("falls back for anything that could leave the site", () => {
    const bad = [
      undefined,
      null,
      "",
      "https://evil.com",
      "//evil.com",
      "/\\evil.com",
      "/\t/evil.com",
      "javascript:alert(1)",
      "dashboard",
    ];
    for (const value of bad) expect(safeNext(value)).toBe(DEFAULT_AFTER_SIGN_IN);
  });

  it("never sends people back to the auth pages", () => {
    expect(safeNext("/sign-in")).toBe(DEFAULT_AFTER_SIGN_IN);
    expect(safeNext("/sign-up?next=/x")).toBe(DEFAULT_AFTER_SIGN_IN);
    expect(safeNext("/sign-inside")).toBe("/sign-inside");
  });

  it("builds auth page links without the default destination", () => {
    expect(authPageHref("sign-in", DEFAULT_AFTER_SIGN_IN)).toBe("/sign-in");
    expect(authPageHref("sign-up", "/editor?a=1")).toBe("/sign-up?next=%2Feditor%3Fa%3D1");
  });
});

describe("auth error messages", () => {
  it("maps codes in any spelling", () => {
    const linked = authErrorMessage("ACCOUNT_NOT_LINKED");
    expect(linked).not.toBe(GENERIC_AUTH_ERROR);
    expect(authErrorMessage("account not linked")).toBe(linked);
    expect(authErrorMessage("account_not_linked")).toBe(linked);
  });

  it("falls back to a generic message", () => {
    expect(authErrorMessage(undefined)).toBe(GENERIC_AUTH_ERROR);
    expect(authErrorMessage("SOMETHING_NEW")).toBe(GENERIC_AUTH_ERROR);
  });
});
