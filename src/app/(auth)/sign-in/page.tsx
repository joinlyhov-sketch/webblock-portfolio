import type { Metadata } from "next";
import { AuthHeader, AuthShell, SignInForm, emailFromSearchParams } from "@/features/auth";
import type { SearchParams } from "@/lib/table-query";

export const metadata: Metadata = { title: "Sign in" };

export default async function SignInPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const email = emailFromSearchParams(await searchParams);
  return (
    <AuthShell headline={{ line1: "Pick up right", line2: "where you", accent: "left off." }}>
      <AuthHeader title="Welcome back" description="Sign in to manage your websites." />
      <SignInForm defaultEmail={email ?? undefined} />
    </AuthShell>
  );
}
