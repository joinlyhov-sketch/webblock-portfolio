"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Lock1 } from "iconsax-reactjs";
import { setPasswordAction } from "../actions";
import { toast } from "@/components/common/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PASSWORD_MAX, PASSWORD_MIN } from "@/lib/validation/fields";
import { Field, SETTINGS_FIELD, SettingsCard } from "./settings-card";

/** "Set a password" for Google-only accounts, "Password" (with the current one) once one exists. */
export function PasswordCard({ hasPassword }: { hasPassword: boolean }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [submittedValues, setSubmittedValues] = useState<{ currentPassword: string; password: string; confirmPassword: string } | null>(null);
  const [state, formAction, pending] = useActionState(setPasswordAction, null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [touched, setTouched] = useState({ currentPassword: false, password: false, confirmPassword: false });

  const [prevState, setPrevState] = useState(state);
  if (prevState !== state) {
    setPrevState(state);
    if (state?.ok) {
      setCurrentPassword("");
      setPassword("");
      setConfirmPassword("");
      setTouched({ currentPassword: false, password: false, confirmPassword: false });
      setSubmittedValues(null);
    }
  }

  useEffect(() => {
    if (!state) return;
    if (state.ok) {
      toast.success(state.message ?? "Password saved");
      formRef.current?.reset();
    } else if (!state.fieldErrors) {
      toast.error("Could not save the password", state.message);
    }
  }, [state]);

  const passwordProblem = (value: string) => {
    if (!value) return "Enter a new password.";
    const requirements: string[] = [];
    if (value.length < PASSWORD_MIN) requirements.push(`at least ${PASSWORD_MIN} characters`);
    if (!/[A-Z]/.test(value)) requirements.push("one uppercase letter");
    if (!/\d/.test(value)) requirements.push("one number");
    if (requirements.length) return `Use ${requirements.join(", ")}.`;
    if (value.length > PASSWORD_MAX) return `Use ${PASSWORD_MAX} characters or fewer.`;
    return undefined;
  };
  const localErrors = {
    currentPassword: hasPassword && touched.currentPassword && !currentPassword ? "Enter your current password." : undefined,
    password: touched.password ? passwordProblem(password) : undefined,
    confirmPassword: touched.confirmPassword
      ? !confirmPassword && password
        ? "Re-enter your password."
        : confirmPassword && confirmPassword !== password
          ? "The passwords do not match."
          : undefined
      : undefined,
  };
  const serverErrorsMatchCurrentValues =
    submittedValues !== null &&
    submittedValues.currentPassword === currentPassword &&
    submittedValues.password === password &&
    submittedValues.confirmPassword === confirmPassword;
  const error = (field: keyof typeof localErrors) =>
    localErrors[field] ??
    (serverErrorsMatchCurrentValues && state && !state.ok ? state.fieldErrors?.[field]?.[0] : undefined);
  const gap = "gap-[7px]";

  return (
    <SettingsCard
      icon={<Lock1 variant="Outline" />}
      title={hasPassword ? "Password" : "Set a password"}
      description={
        hasPassword
          ? `Use at least ${PASSWORD_MIN} characters, one uppercase letter and one symbol.`
          : undefined
      }
    >
      <form
        ref={formRef}
        action={formAction}
        className="flex flex-col gap-4"
        onSubmit={(event) => {
          setTouched({ currentPassword: true, password: true, confirmPassword: true });
          if ((hasPassword && !currentPassword) || passwordProblem(password) || confirmPassword !== password) {
            event.preventDefault();
            setSubmittedValues(null);
            return;
          }
          setSubmittedValues({ currentPassword, password, confirmPassword });
        }}
      >
        {hasPassword && (
          <Field id="currentPassword" label="Current password" error={error("currentPassword")} className={gap}>
            <Input
              id="currentPassword"
              name="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(event) => {
                setCurrentPassword(event.target.value);
                setTouched((current) => ({ ...current, currentPassword: true }));
              }}
              onBlur={() => setTouched((current) => ({ ...current, currentPassword: true }))}
              autoComplete="current-password"
              placeholder="Enter your current password"
              aria-invalid={!!error("currentPassword")}
              aria-describedby={error("currentPassword") ? "currentPassword-hint" : undefined}
              className={SETTINGS_FIELD}
            />
          </Field>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="password" label="New password" error={error("password")} className={gap}>
            <Input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setTouched((current) => ({ ...current, password: true }));
              }}
              onBlur={() => setTouched((current) => ({ ...current, password: true }))}
              maxLength={PASSWORD_MAX}
              autoComplete="new-password"
              placeholder="Enter a new password"
              aria-invalid={!!error("password")}
              aria-describedby={error("password") ? "password-hint" : undefined}
              className={SETTINGS_FIELD}
            />
          </Field>
          <Field
            id="confirmPassword"
            label={hasPassword ? "Confirm new password" : "Confirm password"}
            error={error("confirmPassword")}
            className={gap}
          >
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(event) => {
                setConfirmPassword(event.target.value);
                setTouched((current) => ({ ...current, confirmPassword: true }));
              }}
              onBlur={() => setTouched((current) => ({ ...current, confirmPassword: true }))}
              maxLength={PASSWORD_MAX}
              autoComplete="new-password"
              placeholder="Re-enter the password"
              aria-invalid={!!error("confirmPassword")}
              aria-describedby={error("confirmPassword") ? "confirmPassword-hint" : undefined}
              className={SETTINGS_FIELD}
            />
          </Field>
        </div>
        <div className="flex items-center justify-end">
          <Button type="submit" loading={pending}>
            {hasPassword ? "Change password" : "Set password"}
          </Button>
        </div>
      </form>
    </SettingsCard>
  );
}
