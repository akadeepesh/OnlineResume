import type { ServerEnv } from "@/lib/env";

// ============================================================================
// Social sign-in providers. A provider is on only when both its id and secret
// are set, so a half-configured deployment hides the button instead of
// sending people to a broken OAuth page.
// ============================================================================

export const SOCIAL_PROVIDERS = ["google", "github"] as const;
export type SocialProvider = (typeof SOCIAL_PROVIDERS)[number];

type ProviderEnv = Pick<ServerEnv, "GOOGLE_CLIENT_ID" | "GOOGLE_CLIENT_SECRET" | "GITHUB_CLIENT_ID" | "GITHUB_CLIENT_SECRET">;

interface ProviderCredentials {
  clientId: string;
  clientSecret: string;
}

/** Better Auth's `socialProviders` option, with only the configured providers. */
export function socialProviders(env: ProviderEnv): Partial<Record<SocialProvider, ProviderCredentials>> {
  const pairs: Record<SocialProvider, [string | undefined, string | undefined]> = {
    google: [env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET],
    github: [env.GITHUB_CLIENT_ID, env.GITHUB_CLIENT_SECRET],
  };
  const result: Partial<Record<SocialProvider, ProviderCredentials>> = {};
  for (const provider of SOCIAL_PROVIDERS) {
    const [clientId, clientSecret] = pairs[provider];
    if (clientId && clientSecret) result[provider] = { clientId, clientSecret };
  }
  return result;
}

/** Providers to show buttons for, in display order. */
export function enabledProviders(env: ProviderEnv): SocialProvider[] {
  const configured = socialProviders(env);
  return SOCIAL_PROVIDERS.filter((provider) => provider in configured);
}
