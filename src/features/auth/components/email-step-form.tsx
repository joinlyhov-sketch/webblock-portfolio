"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "iconsax-reactjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { emailInput, parseForm, registerInput, type FieldErrors } from "../schemas";
import { Field, FormFooter, OrDivider } from "./field";
import { GoogleButton } from "./google-button";

/**
 * Step 1 of register (full name + email) and of forgot password (email only).
 * On success it goes to the code screen with the email in the URL.
 */
export function EmailStepForm({ mode }: { mode: "register" | "forgot-password" }) {
  const router = useRouter();
  const [errors, setErrors] = useState<FieldErrors>({});
  const isRegister = mode === "register";

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const result = parseForm(isRegister ? registerInput : emailInput, new FormData(e.currentTarget));
    if (!result.ok) return setErrors(result.fieldErrors);
    setErrors({});
    // TODO(auth): call the "send code" action first; the backend creates and emails the OTP.
    const next = isRegister ? "/verify-otp" : "/forgot-password/verify";
    router.push(`${next}?email=${encodeURIComponent(result.data.email)}`);
  }

  return (
    <>
      {isRegister && (
        <>
          <GoogleButton label="Sign up with Google" />
          <OrDivider label="or sign up with email" />
        </>
      )}
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-[18px]">
        {isRegister && (
          <Field id="fullName" label="Full name" error={errors.fullName?.[0]}>
            <Input
              size="lg"
              id="fullName"
              name="fullName"
              autoComplete="name"
              placeholder="Your full name"
              aria-invalid={!!errors.fullName || undefined}
              aria-describedby="fullName-msg"
            />
          </Field>
        )}
        <Field
          id="email"
          label="Email"
          error={errors.email?.[0]}
          hint={
            isRegister
              ? "We’ll send a 6-digit code to confirm it’s you."
              : "We’ll send a 6-digit code to reset your password."
          }
        >
          <Input
            size="lg"
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            aria-invalid={!!errors.email || undefined}
            aria-describedby="email-msg"
          />
        </Field>
        <Button type="submit" size="lg" className="mt-1 w-full">
          {isRegister ? "Continue" : "Send code"}
          <ArrowRight />
        </Button>
      </form>
      <FormFooter>
        {isRegister ? "Already have an account?" : "Remember your password?"}{" "}
        <Link href="/sign-in" className="font-semibold text-primary hover:underline">
          Sign in
        </Link>
      </FormFooter>
    </>
  );
}
