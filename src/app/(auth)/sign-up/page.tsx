import type { Metadata } from "next";
import { AuthPage, type AuthSearchParams } from "../auth-page";

export const metadata: Metadata = { title: "Create account" };

export default function SignUpPage({ searchParams }: { searchParams: AuthSearchParams }) {
  return <AuthPage mode="sign-up" searchParams={searchParams} />;
}
