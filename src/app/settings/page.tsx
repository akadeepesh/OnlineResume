import type { Metadata } from "next";
import AppHeader from "@/components/AppHeader";
import { DeleteAccount, ExportSettings, ProfileSettings, UsernameSettings } from "@/components/settings/SettingsForms";
import { requireOnboarded } from "@/lib/auth/session";
import { clientEnv } from "@/lib/env";

export const metadata: Metadata = {
  title: "Settings",
  robots: { index: false, follow: false },
};

export default async function SettingsPage() {
  const { user, username } = await requireOnboarded("/settings");

  return (
    <div className="min-h-screen bg-neutral-50">
      <AppHeader email={user.email} current="settings" />
      <main className="mx-auto grid max-w-3xl gap-6 px-6 py-10">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Settings</h1>
        <ProfileSettings name={user.name} email={user.email} />
        <UsernameSettings username={username} linkPrefix={`${new URL(clientEnv.NEXT_PUBLIC_SITE_URL).host}/`} />
        <ExportSettings />
        <DeleteAccount username={username} />
      </main>
    </div>
  );
}
