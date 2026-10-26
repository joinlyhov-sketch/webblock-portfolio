import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthHeader, AuthShell, NewPasswordForm, emailFromSearchParams } from "@/features/auth";
import type { SearchParams } from "@/lib/table-query";

export const metadata: Metadata = { title: "Create a password" };

export default async function CreatePasswordPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const email = emailFromSearchParams(await searchParams);
  if (!email) redirect("/register");
  return (
    <AuthShell headline={{ line1: "Your sites, your shop,", accent: "safely yours." }}>
      <AuthHeader
        step={3}
        title="Create a password"
        description={
          <>
            You’ll use it with <b className="font-bold text-foreground">{email}</b> to sign in.
          </>
        }
      />
      <NewPasswordForm email={email} mode="create" />
    </AuthShell>
  );
}
