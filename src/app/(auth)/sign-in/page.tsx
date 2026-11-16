import type { Metadata } from "next";
import { AuthPage, type AuthSearchParams } from "../auth-page";

export const metadata: Metadata = { title: "Sign in" };

export default function SignInPage({ searchParams }: { searchParams: AuthSearchParams }) {
  return <AuthPage mode="sign-in" searchParams={searchParams} />;
}
