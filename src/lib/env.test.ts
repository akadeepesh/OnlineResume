import { describe, expect, it } from "vitest";
import { clientEnvSchema, parseEnv, serverEnvSchema } from "./env";

describe("client env", () => {
  it("defaults the site URL for local development", () => {
    expect(parseEnv(clientEnvSchema, {})).toEqual({ NEXT_PUBLIC_SITE_URL: "http://localhost:3000" });
  });

  it("treats blank values as unset (Vercel and .env files often hold \"\")", () => {
    expect(parseEnv(clientEnvSchema, { NEXT_PUBLIC_SITE_URL: "  " }).NEXT_PUBLIC_SITE_URL).toBe("http://localhost:3000");
  });

  it("reads the site URL and rejects anything that isn't one", () => {
    expect(parseEnv(clientEnvSchema, { NEXT_PUBLIC_SITE_URL: "https://resume.akadeepesh.com" }).NEXT_PUBLIC_SITE_URL).toBe(
      "https://resume.akadeepesh.com",
    );
    expect(() => parseEnv(clientEnvSchema, { NEXT_PUBLIC_SITE_URL: "not a url" })).toThrow(/NEXT_PUBLIC_SITE_URL/);
  });
});

describe("server env", () => {
  it("accepts a Postgres URL and rejects anything else", () => {
    expect(parseEnv(serverEnvSchema, {}).DATABASE_URL).toBeUndefined();
    const url = "postgresql://user:pw@ep-x.eu-central-1.aws.neon.tech/neondb?sslmode=require";
    expect(parseEnv(serverEnvSchema, { DATABASE_URL: url }).DATABASE_URL).toBe(url);
    expect(() => parseEnv(serverEnvSchema, { DATABASE_URL: "mysql://nope" })).toThrow(/DATABASE_URL/);
  });

  it("requires a long auth secret and a real auth URL", () => {
    expect(parseEnv(serverEnvSchema, {}).BETTER_AUTH_SECRET).toBeUndefined();
    expect(() => parseEnv(serverEnvSchema, { BETTER_AUTH_SECRET: "short" })).toThrow(/BETTER_AUTH_SECRET/);
    expect(parseEnv(serverEnvSchema, { BETTER_AUTH_SECRET: "x".repeat(32) }).BETTER_AUTH_SECRET).toHaveLength(32);
    expect(() => parseEnv(serverEnvSchema, { BETTER_AUTH_URL: "localhost" })).toThrow(/BETTER_AUTH_URL/);
  });
});
