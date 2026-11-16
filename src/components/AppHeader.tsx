import Link from "next/link";
import SignOutButton from "@/components/auth/SignOutButton";

/** Top bar for signed-in pages (dashboard, settings). */
export default function AppHeader({ email, current }: { email: string; current: "dashboard" | "settings" }) {
  const link = (href: string, label: string, active: boolean) => (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={active ? "font-medium text-neutral-900" : "text-neutral-500 hover:text-neutral-900"}
    >
      {label}
    </Link>
  );
  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between gap-4 px-6">
        <div className="flex items-center gap-6 text-sm">
          <Link href="/" className="font-semibold text-neutral-900">
            OnlineResume
          </Link>
          <nav className="flex items-center gap-4" aria-label="Account">
            {link("/dashboard", "Resumes", current === "dashboard")}
            {link("/settings", "Settings", current === "settings")}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-neutral-500 md:inline">{email}</span>
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}
