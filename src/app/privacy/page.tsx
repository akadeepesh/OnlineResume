import type { Metadata } from "next";
import Link from "next/link";
import LegalPage from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Privacy",
  description: "What OnlineResume stores, why, and how to export or delete it.",
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy" updated="17 November 2026">
      <p>
        OnlineResume turns your resume into a link you can share. This page explains what we store to do that, who
        else is involved, and how you stay in control. The short version: we keep what you give us to build your
        resume, we don&apos;t sell it, and you can export or delete it at any time.
      </p>

      <h2>Without an account</h2>
      <p>
        The editor works without signing in. Your draft is saved in your own browser (local storage) and never sent
        to us, unless you later choose to save it to an account.
      </p>

      <h2>What we store when you sign up</h2>
      <ul>
        <li>
          <strong>Account details:</strong> your name, email address, the username you pick, and a profile picture
          if your sign-in provider shares one.
        </li>
        <li>
          <strong>Sign-in data:</strong> a securely hashed password if you use email and password, or a link to your
          Google or GitHub account if you sign in with them. We never see your Google or GitHub password.
        </li>
        <li>
          <strong>Sessions:</strong> a session cookie that keeps you signed in, along with the browser and IP address
          the session started from, so sessions can be reviewed and ended.
        </li>
        <li>
          <strong>Your resumes:</strong> everything you write in the editor, the template you pick and your sharing
          settings.
        </li>
        <li>
          <strong>Uploaded files:</strong> if you import a resume from a file, we keep the original so you can download
          it again. You decide whether visitors can download it too.
        </li>
        <li>
          <strong>Usage counts:</strong> how many AI-assisted imports you used each day, to apply the daily limit.
        </li>
      </ul>

      <h2>What&apos;s public</h2>
      <p>
        Resumes are private until you publish them. A published resume can be seen by anyone with its link. Search
        engines are asked not to list it unless you turn that on in the Share settings. Unpublished resumes return
        &ldquo;not found&rdquo; to everyone but you.
      </p>

      <h2>Who else is involved</h2>
      <ul>
        <li>
          <strong>Vercel</strong> hosts the site.
        </li>
        <li>
          <strong>Neon</strong> hosts the database where your account and resumes are stored.
        </li>
        <li>
          <strong>Google and GitHub</strong>, only if you choose to sign in with them.
        </li>
        <li>
          <strong>An AI provider</strong>, only when you use AI-assisted import: the text of the resume you import is
          sent to it to be structured, and nothing else.
        </li>
        <li>
          <strong>Sentry</strong>, for error reports: when something breaks, the error and where it happened in our
          code, without your name, email or resume content.
        </li>
      </ul>
      <p>We don&apos;t sell your data, show ads, or use tracking or analytics cookies.</p>

      <h2>Your control</h2>
      <ul>
        <li>
          <strong>Export:</strong> download everything we store about you from{" "}
          <Link href="/settings">Settings</Link>.
        </li>
        <li>
          <strong>Delete:</strong> deleting your account in <Link href="/settings">Settings</Link> removes your
          account, resumes, files and links straight away. Backups kept by our database provider expire on their own
          schedule.
        </li>
        <li>
          <strong>Correct:</strong> change your name, username and resumes at any time.
        </li>
      </ul>

      <h2>Changes</h2>
      <p>
        If this policy changes in a way that matters, we&apos;ll update the date above and point it out in the app.
      </p>

      <p>
        Questions? Reach the maintainer through <a href="https://akadeepesh.com">akadeepesh.com</a>.
      </p>
    </LegalPage>
  );
}
