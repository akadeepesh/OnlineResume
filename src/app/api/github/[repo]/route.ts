import { NextResponse } from "next/server";
import { EnvData, getEnvData } from "../../../../../env";

const envData: EnvData = getEnvData();
export async function GET(
  request: Request,
  { params }: { params: { repo: string } }
) {
  const repo = params.repo;
  const enableGithubFetch = envData.NEXT_PUBLIC_GITHUB_FETCH_ENABLED === "true";
  const githubOwner = envData.NEXT_PUBLIC_GH_OWNER;

  if (!enableGithubFetch || !githubOwner) {
    return NextResponse.json(
      { error: "GitHub fetching disabled. See README to configure env." },
      { status: 400 }
    );
  }

  try {
    const headers: HeadersInit = {
      Accept: "application/vnd.github.v3+json",
    };

    if (envData.GITHUB_TOKEN) {
      headers["Authorization"] = `token ${envData.GITHUB_TOKEN}`;
    }

    const response = await fetch(
      `https://api.github.com/repos/${githubOwner}/${repo}`,
      { headers }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch repository data from GitHub API" },
        { status: response.status }
      );
    }

    const data = await response.json();

    const sanitizedData = {
      stargazers_count: data.stargazers_count,
      forks_count: data.forks_count,
      updated_at: data.updated_at,
      description: data.description,
      open_issues_count: data.open_issues_count,
      topics: data.topics,
      size: data.size,
    };

    return NextResponse.json(sanitizedData);
  } catch (error) {
    console.error("Error fetching repo data:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
