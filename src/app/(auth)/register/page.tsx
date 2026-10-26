import type { Metadata } from "next";
import { AuthHeader, AuthShell, EmailStepForm } from "@/features/auth";

export const metadata: Metadata = { title: "Create your account" };

export default function RegisterPage() {
  return (
    <AuthShell headline={{ line1: "Your website, live", line2: "in an", accent: "afternoon." }}>
      <AuthHeader
        step={1}
        title="Create your account"
        description="Free to start. No card needed for your 14-day trial."
      />
      <EmailStepForm mode="register" />
    </AuthShell>
  );
}
