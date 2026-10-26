"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { parseForm, signInInput, type FieldErrors } from "../schemas";
import { Field, FormFooter, OrDivider } from "./field";
import { GoogleButton } from "./google-button";
import { PasswordInput } from "./password-input";

export function SignInForm({ defaultEmail }: { defaultEmail?: string }) {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [notice, setNotice] = useState<string | null>(null);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const result = parseForm(signInInput, new FormData(e.currentTarget));
    setErrors(result.ok ? {} : result.fieldErrors);
    // TODO(auth): replace with signInAction via useActionState once the invariant hook
    // allows public auth actions (they can't start with require*() — nobody is signed in yet).
    setNotice(result.ok ? "Sign-in isn't connected to the server yet." : null);
  }

  return (
    <>
      <GoogleButton label="Continue with Google" />
      <OrDivider />
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-[18px]">
        <Field id="email" label="Email" error={errors.email?.[0]}>
          <Input
            size="lg"
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            defaultValue={defaultEmail}
            aria-invalid={!!errors.email || undefined}
            aria-describedby="email-msg"
          />
        </Field>
        <Field
          id="password"
          label="Password"
          error={errors.password?.[0]}
          aside={
            <Link href="/forgot-password" className="text-[13px] font-semibold text-primary hover:underline">
              Forgot password?
            </Link>
          }
        >
          <PasswordInput
            id="password"
            name="password"
            autoComplete="current-password"
            placeholder="Your password"
            aria-invalid={!!errors.password || undefined}
            aria-describedby="password-msg"
          />
        </Field>
        <Button type="submit" size="lg" className="mt-1 w-full">
          Sign in
        </Button>
        {notice && (
          <p role="status" className="rounded-[14px] bg-primary-soft px-3.5 py-3 text-[13px] text-foreground-soft">
            {notice}
          </p>
        )}
      </form>
      <FormFooter>
        New to WebBlock?{" "}
        <Link href="/register" className="font-semibold text-primary hover:underline">
          Create an account
        </Link>
      </FormFooter>
    </>
  );
}
