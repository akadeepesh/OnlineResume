import { OG_SIZE, siteCardImage } from "@/lib/og/resume-card";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "OnlineResume: your resume, as a link";

export default function Image() {
  return siteCardImage();
}
