import type { Metadata } from "next";
import Link from "next/link";
import LegalPage from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Terms",
  description: "The rules for using OnlineResume.",
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms" updated="17 November 2026">
      <p>
        These terms cover your use of OnlineResume. By creating an account or publishing a resume, you agree to them.
        They&apos;re written to be read, so they&apos;re short.
      </p>

      <h2>Your content</h2>
      <p>
        You own what you write and upload. You give us permission to store it, display it in the templates you choose
        and show it to the people you share it with, only so we can run the service. That permission ends when you
        delete the content or your account.
      </p>

      <h2>Keep it honest and legal</h2>
      <ul>
        <li>Only publish information about yourself, or that you have permission to publish.</li>
        <li>Don&apos;t impersonate anyone or misrepresent who you are.</li>
        <li>Don&apos;t upload anything illegal, malicious, or that infringes someone else&apos;s rights.</li>
        <li>Don&apos;t abuse the service: no spam, scraping at scale, or attempts to break or overload it.</li>
      </ul>
      <p>We may remove content or suspend accounts that break these rules.</p>

      <h2>Usernames</h2>
      <p>
        Usernames are first come, first served. Some names are reserved. We may reclaim a username that impersonates
        a person or organisation, or that&apos;s held only to stop others from using it.
      </p>

      <h2>Free plan and limits</h2>
      <p>
        OnlineResume is free to use, with limits such as the number of resumes and daily AI-assisted imports. Limits
        may change; we&apos;ll keep them reasonable and tell you in the app.
      </p>

      <h2>No guarantees</h2>
      <p>
        We work to keep the service running and your data safe, but it&apos;s provided as is, without warranties.
        Keep your own copy of anything important: you can export it at any time from{" "}
        <Link href="/settings">Settings</Link>. To the extent the law allows, we aren&apos;t liable for indirect
        losses from using the service.
      </p>

      <h2>Leaving</h2>
      <p>
        You can delete your account at any time. If we ever shut the service down, we&apos;ll give notice so you can
        export your data first.
      </p>

      <h2>Changes</h2>
      <p>If these terms change in a way that matters, we&apos;ll update the date above and point it out in the app.</p>

      <p>
        See also the <Link href="/privacy">privacy policy</Link>. Questions? Reach the maintainer through{" "}
        <a href="https://akadeepesh.com">akadeepesh.com</a>.
      </p>
    </LegalPage>
  );
}
