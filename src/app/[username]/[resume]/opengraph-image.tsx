import { OG_SIZE, resumeCardImage } from "@/lib/og/resume-card";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Resume preview";

export default async function Image({ params }: { params: Promise<{ username: string; resume: string }> }) {
  const { username, resume } = await params;
  return resumeCardImage(username, resume);
}
