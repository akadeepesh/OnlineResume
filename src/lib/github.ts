"use client";

import { useEffect, useState } from "react";
import { EnvData, getEnvData } from "../../env";

export interface RepoData {
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  description: string;
  open_issues_count: number;
  topics: string[];
  size: number;
}

// this object contains all the environment variables
const envData: EnvData = getEnvData();

export const githubFetchEnabled =
  envData.NEXT_PUBLIC_GITHUB_FETCH_ENABLED === "true" &&
  Boolean(envData.NEXT_PUBLIC_GH_OWNER);

export const repoUrl = (name: string) =>
  `https://github.com/${envData.NEXT_PUBLIC_GH_OWNER || "placeholder"}/${name}`;

/**
 * Fetches live stats for a repository through the /api/github/[repo] route.
 * Shared by every template so they all talk to the same backend.
 */
export function useRepoData(name: string) {
  const [data, setData] = useState<RepoData | null>(null);
  const [loading, setLoading] = useState(githubFetchEnabled);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!githubFetchEnabled) return;

    let cancelled = false;
    const fetchRepoData = async () => {
      try {
        const response = await fetch(`/api/github/${encodeURIComponent(name)}`);
        const json = await response.json();
        if (cancelled) return;
        if (response.ok) {
          setData(json);
          setError(null);
        } else {
          setError(json.error || "Failed to load repository data.");
        }
      } catch (err) {
        console.error("Error fetching repo data:", err);
        if (!cancelled) setError("Failed to load repository data.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchRepoData();
    return () => {
      cancelled = true;
    };
  }, [name]);

  return { data, loading, error, enabled: githubFetchEnabled };
}

export const formatRepoDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

// GitHub reports repository size in KB
export const formatRepoSize = (kb: number) =>
  kb < 1024 ? `${kb} KB` : `${(kb / 1024).toFixed(1)} MB`;
