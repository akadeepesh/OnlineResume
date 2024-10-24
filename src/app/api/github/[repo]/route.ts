import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { repo: string } }
) {
  const repo = params.repo;

  try {
    const response = await fetch(
      `https://api.github.com/repos/akadeepesh/${repo}`,
      {
        headers: {
          Authorization: `token ${process.env.GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("GitHub API request failed");
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
      { error: "Failed to fetch repository data" },
      { status: 500 }
    );
  }
}
