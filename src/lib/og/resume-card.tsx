import { ImageResponse } from "next/og";
import { isAuthConfigured } from "@/lib/auth/server";
import { clientEnv } from "@/lib/env";
import { parseResumeDraft } from "@/lib/resume/draft";
import { findResumeByAddress } from "@/lib/resumes/queries";

// ============================================================================
// The link-preview image for a public resume (LinkedIn, X, Slack, WhatsApp).
// Only published resumes get a personal card. Anything else gets the generic
// site card, so a private resume's name never appears in a preview.
// ============================================================================

export const OG_SIZE = { width: 1200, height: 630 };

const ADDRESS_PART = /^[a-z0-9-]{1,60}$/;

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]!.toUpperCase())
    .join("");

/** Only images we can safely embed: https URLs and our own JPEG/PNG data URLs. */
const usableAvatar = (avatar: string | undefined) =>
  avatar && (/^https:\/\//.test(avatar) || /^data:image\/(jpeg|png);base64,/.test(avatar)) ? avatar : null;

function Card({ name, role, tagline, avatar, link }: { name: string; role?: string; tagline?: string; avatar: string | null; link: string }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        background: "#fafaf9",
        color: "#1c1917",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
        {avatar ? (
          // eslint-disable-next-line @next/next/no-img-element -- rendered to an image, not a page
          <img src={avatar} width={168} height={168} style={{ borderRadius: 84, objectFit: "cover" }} alt="" />
        ) : (
          <div
            style={{
              width: 168,
              height: 168,
              borderRadius: 84,
              background: "#e7e5e4",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 64,
              fontWeight: 700,
              color: "#57534e",
            }}
          >
            {initials(name)}
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 820 }}>
          <div style={{ fontSize: 72, fontWeight: 700, lineHeight: 1.05 }}>{name}</div>
          {role && <div style={{ fontSize: 40, color: "#57534e", marginTop: 12 }}>{role}</div>}
        </div>
      </div>
      {tagline && <div style={{ fontSize: 34, color: "#44403c", lineHeight: 1.35, maxWidth: 1000 }}>{tagline.slice(0, 140)}</div>}
      <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 30, color: "#059669", fontWeight: 600 }}>
        <div style={{ width: 14, height: 14, borderRadius: 7, background: "#059669" }} />
        {link}
      </div>
    </div>
  );
}

function GenericCard({ host }: { host: string }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: 72,
        background: "#fafaf9",
        color: "#1c1917",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ fontSize: 80, fontWeight: 700 }}>OnlineResume</div>
      <div style={{ fontSize: 40, color: "#57534e", marginTop: 16 }}>Your resume, as a link.</div>
      <div style={{ fontSize: 30, color: "#059669", marginTop: 48, fontWeight: 600 }}>{host}</div>
    </div>
  );
}

/** The site's own card (landing page, private or missing resumes). */
export function siteCardImage(): ImageResponse {
  return new ImageResponse(<GenericCard host={new URL(clientEnv.NEXT_PUBLIC_SITE_URL).host} />, OG_SIZE);
}

export async function resumeCardImage(rawUsername: string, rawSlug: string | null): Promise<ImageResponse> {
  const username = rawUsername.toLowerCase();
  const slug = rawSlug?.toLowerCase() ?? null;
  if (!ADDRESS_PART.test(username) || (slug !== null && !ADDRESS_PART.test(slug)) || !isAuthConfigured()) {
    return siteCardImage();
  }

  const found = await findResumeByAddress(username, slug);
  const parsed = found?.resume.isPublished ? parseResumeDraft(found.resume.data) : null;
  if (!found || !parsed?.success || !parsed.data.profile.name.trim()) return siteCardImage();

  const { profile } = parsed.data;
  const host = new URL(clientEnv.NEXT_PUBLIC_SITE_URL).host;
  return new ImageResponse(
    <Card
      name={profile.name}
      role={profile.role}
      tagline={profile.tagline}
      avatar={usableAvatar(profile.avatar)}
      link={slug === null ? `${host}/${username}` : `${host}/${username}/${slug}`}
    />,
    OG_SIZE,
  );
}
