import { describe, expect, it } from "vitest";
import { clientEnvSchema, parseEnv, serverEnvSchema } from "./env";

describe("client env", () => {
  it("has working defaults when nothing is set", () => {
    expect(parseEnv(clientEnvSchema, {})).toEqual({
      NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
      NEXT_PUBLIC_TEMPLATE: undefined,
      NEXT_PUBLIC_SHOW_TEMPLATE_SWITCHER: true,
      NEXT_PUBLIC_ENABLE_GITHUB_FETCH: false,
      NEXT_PUBLIC_GH_OWNER: undefined,
    });
  });

  it("treats blank values as unset (Vercel and .env files often hold \"\")", () => {
    const env = parseEnv(clientEnvSchema, {
      NEXT_PUBLIC_SITE_URL: "",
      NEXT_PUBLIC_SHOW_TEMPLATE_SWITCHER: "  ",
      NEXT_PUBLIC_GH_OWNER: "",
    });
    expect(env.NEXT_PUBLIC_SITE_URL).toBe("http://localhost:3000");
    expect(env.NEXT_PUBLIC_SHOW_TEMPLATE_SWITCHER).toBe(true);
    expect(env.NEXT_PUBLIC_GH_OWNER).toBeUndefined();
  });

  it("reads flags and values", () => {
    const env = parseEnv(clientEnvSchema, {
      NEXT_PUBLIC_SITE_URL: "https://resume.akadeepesh.com",
      NEXT_PUBLIC_SHOW_TEMPLATE_SWITCHER: "false",
      NEXT_PUBLIC_ENABLE_GITHUB_FETCH: "true",
      NEXT_PUBLIC_TEMPLATE: " bento ",
    });
    expect(env.NEXT_PUBLIC_SITE_URL).toBe("https://resume.akadeepesh.com");
    expect(env.NEXT_PUBLIC_SHOW_TEMPLATE_SWITCHER).toBe(false);
    expect(env.NEXT_PUBLIC_ENABLE_GITHUB_FETCH).toBe(true);
    expect(env.NEXT_PUBLIC_TEMPLATE).toBe("bento");
  });

  it("names every invalid variable in one error", () => {
    expect(() =>
      parseEnv(clientEnvSchema, { NEXT_PUBLIC_SITE_URL: "not a url", NEXT_PUBLIC_ENABLE_GITHUB_FETCH: "yes" }),
    ).toThrow(/NEXT_PUBLIC_SITE_URL[\s\S]*NEXT_PUBLIC_ENABLE_GITHUB_FETCH|NEXT_PUBLIC_ENABLE_GITHUB_FETCH[\s\S]*NEXT_PUBLIC_SITE_URL/);
  });
});

describe("server env", () => {
  it("keeps the GitHub token optional", () => {
    expect(parseEnv(serverEnvSchema, {}).GITHUB_TOKEN).toBeUndefined();
    expect(parseEnv(serverEnvSchema, { GITHUB_TOKEN: "abc" }).GITHUB_TOKEN).toBe("abc");
  });
});
