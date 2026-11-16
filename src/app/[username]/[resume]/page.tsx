import type { Metadata } from "next";
import { PublicResume, publicMetadata, type AddressParams } from "../public-resume";

export async function generateMetadata({ params }: { params: AddressParams }): Promise<Metadata> {
  const { username, resume } = await params;
  return publicMetadata(username, resume ?? null);
}

/** One of the user's other resumes, by its slug. */
export default async function ResumeBySlugPage({ params }: { params: AddressParams }) {
  const { username, resume } = await params;
  return <PublicResume username={username} slug={resume ?? null} />;
}
