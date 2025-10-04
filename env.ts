export interface EnvData {
  NEXT_PUBLIC_GITHUB_FETCH_ENABLED: string;
  NEXT_PUBLIC_GH_OWNER: string;
  GITHUB_TOKEN?: string;
}

// this is to avoid calling process.env multiple times
// calling process.env is expensive, so i added a small performance optimization
export const getEnvData = (): EnvData => {
  return {
    NEXT_PUBLIC_GITHUB_FETCH_ENABLED:
      process.env.NEXT_PUBLIC_ENABLE_GITHUB_FETCH || "false",
    NEXT_PUBLIC_GH_OWNER: process.env.NEXT_PUBLIC_GH_OWNER || "",
    GITHUB_TOKEN: process.env.GITHUB_TOKEN,
  };
};
