import type { Metadata } from "next";
import { PublicResume, publicMetadata, type AddressParams } from "./public-resume";

export async function generateMetadata({ params }: { params: AddressParams }): Promise<Metadata> {
  const { username } = await params;
  return publicMetadata(username, null);
}

/** The user's primary resume. */
export default async function PrimaryResumePage({ params }: { params: AddressParams }) {
  const { username } = await params;
  return <PublicResume username={username} slug={null} />;
}
