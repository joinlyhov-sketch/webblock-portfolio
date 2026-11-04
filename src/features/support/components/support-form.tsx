"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Card, CloseCircle, Cloud, Edit2, Global, Lock1, More, Send2, Tag } from "iconsax-reactjs";
import { sendSupportMessageAction } from "../actions";
import { FormField } from "@/components/common/form-field";
import { Modal } from "@/components/common/modal";
import { toast } from "@/components/common/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SelectField } from "@/components/common/select-field";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { SUPPORT_LIMITS as LIMITS } from "../schemas";
import type { SupportView } from "../service";
import { SentArt } from "./envelope-art";

const topicIcons: Record<string, React.ReactNode> = {
  editing: <Edit2 variant="Outline" className="size-[14px]" />,
  publishing: <Cloud variant="Outline" className="size-4" />,
  domain: <Global variant="Outline" className="size-4" />,
  billing: <Card variant="Outline" className="size-4" />,
  other: <More variant="Outline" className="size-4" />,
};

const labelClass = "text-[13px] leading-[19.5px]";
const fieldClass = "h-[46px] rounded-xl bg-background px-3.5 pl-[42px] text-sm";
const fieldIconClass = "left-3.5 text-foreground";

/** The support form. A successful send opens the "Message sent" popup with the ticket. */
export function SupportForm({ view }: { view: Pick<SupportView, "email" | "websites" | "topics"> }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [topic, setTopic] = useState(view.topics[0]?.id ?? "");
  const [state, formAction, pending] = useActionState(sendSupportMessageAction, null);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [touched, setTouched] = useState({ subject: false, message: false });
  // The popup shows for the newest successful result until the user dismisses that result.
  const [dismissed, setDismissed] = useState<unknown>(null);

  useEffect(() => {
    if (state && !state.ok && !state.fieldErrors) {
      toast.error("Could not send your message", state.message);
    }
  }, [state]);

  const receipt = state?.ok ? state.data : null;
  const sentOpen = receipt !== null && dismissed !== state;
  const error = (field: string) => (state && !state.ok ? state.fieldErrors?.[field]?.[0] : undefined);
  const kept = (field: string) => (state && !state.ok ? state.values?.[field] : undefined);
  const savedError = (field: string, value: string) =>
    kept(field)?.trim() === value.trim() ? error(field) : undefined;
  const subjectError = touched.subject && !subject.trim()
    ? "Subject is required."
    : savedError("subject", subject);
  const trimmedMessage = message.trim();
  const messageError = touched.message && !trimmedMessage
    ? "Message is required."
    : touched.message && trimmedMessage.length < 10
      ? "Message must be at least 10 characters."
      : savedError("message", message);

  function writeAnother() {
    setDismissed(state);
    formRef.current?.reset();
    setSubject("");
    setMessage("");
    setTouched({ subject: false, message: false });
    setTopic(view.topics[0]?.id ?? "");
  }

  return (
    <>
      <form
        ref={formRef}
        action={formAction}
        className="flex flex-col gap-5 overflow-clip rounded-[20px] border border-border bg-background p-6 shadow-support"
        onSubmit={(event) => {
          setTouched({ subject: true, message: true });
          if (!subject.trim() || trimmedMessage.length < 10) event.preventDefault();
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="from" label="From" className="min-w-0" labelClassName={labelClass}>
            <Input
              id="from"
              value={view.email}
              icon={<Lock1 variant="Outline" />}
              iconClassName={fieldIconClass}
              className={cn(fieldClass, "disabled:bg-field-disabled disabled:text-muted-foreground")}
              disabled
              readOnly
            />
          </FormField>
          <FormField id="site" label="Website" className="min-w-0" labelClassName={labelClass}>
            <SelectField
              id="site"
              name="site"
              icon={<Global variant="Outline" />}
              iconClassName={fieldIconClass}
              className={fieldClass}
              defaultValue={kept("site") ?? view.websites[0]?.id ?? ""}
              options={[
                ...view.websites.map((website) => ({ value: website.id, label: website.name })),
                { value: "", label: "Not about a website" },
              ]}
            />
          </FormField>
        </div>

        <fieldset className="flex flex-col gap-2">
          <legend className={cn(labelClass, "mb-2 font-semibold")}>Topic</legend>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Topic">
            {view.topics.map((t) => {
              const active = t.id === topic;
              return (
                <button
                  key={t.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setTopic(t.id)}
                  className={cn(
                    "inline-flex h-[34px] items-center gap-2 rounded-full border-[0.8px] px-3.5 text-[13px] leading-[19.5px] font-medium whitespace-nowrap outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/40",
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground-soft hover:border-primary/40 hover:bg-primary-soft",
                  )}
                >
                  {topicIcons[t.id]}
                  {t.label}
                </button>
              );
            })}
          </div>
          <input type="hidden" name="topic" value={topic} />
          {error("topic") && (
            <p role="alert" className="text-[13px] text-danger">
              {error("topic")}
            </p>
          )}
        </fieldset>

        <FormField id="subject" label="Subject" labelClassName={labelClass} error={subjectError}>
          <Input
            id="subject"
            name="subject"
            maxLength={LIMITS.subject}
            icon={<Tag variant="Outline" />}
            iconClassName={fieldIconClass}
            className={fieldClass}
            value={subject}
            onChange={(event) => {
              setSubject(event.target.value);
              setTouched((current) => ({ ...current, subject: true }));
            }}
            onBlur={() => setTouched((current) => ({ ...current, subject: true }))}
            placeholder="e.g. My last deploy failed"
            aria-invalid={!!subjectError}
            aria-describedby={cn(subjectError && "subject-hint", subject.length > 0 && "subject-count") || undefined}
          />
          {subject.length > 0 && (
            <p
              id="subject-count"
              className={cn("text-right text-xs", subject.length >= LIMITS.subject ? "text-danger" : "text-placeholder")}
            >
              {subject.length}/{LIMITS.subject}
            </p>
          )}
        </FormField>

        <FormField id="message" label="Message" labelClassName={labelClass} error={messageError}>
          <Textarea
            id="message"
            name="message"
            maxLength={LIMITS.message}
            value={message}
            onChange={(event) => {
              setMessage(event.target.value);
              setTouched((current) => ({ ...current, message: true }));
            }}
            onBlur={() => setTouched((current) => ({ ...current, message: true }))}
            placeholder="Tell us what happened and what you expected."
            className="min-h-[150px] rounded-xl px-3.5 py-3 text-sm leading-[21.7px]"
            aria-invalid={!!messageError}
            aria-describedby={cn(messageError && "message-hint", message.length > 0 && "message-count") || undefined}
          />
          {message.length > 0 && (
            <p
              id="message-count"
              className={cn("text-right text-xs", message.length >= LIMITS.message ? "text-danger" : "text-placeholder")}
            >
              {message.length}/{LIMITS.message}
            </p>
          )}
        </FormField>

        <div className="flex justify-end">
          <Button type="submit" size="lg" loading={pending}>
            <Send2 variant="Outline" /> Send email
          </Button>
        </div>
      </form>

      <Modal
        open={sentOpen}
        onClose={() => setDismissed(state)}
        label="Message sent"
        className="max-w-[520px] rounded-[28px] border border-background/70 shadow-[0_36px_90px_rgb(132_132_132/0.38),0_4px_12px_rgb(15_23_42/0.18)] backdrop:bg-overlay backdrop:backdrop-blur-[7px]"
      >
        {receipt && (
          <div className="relative flex flex-col gap-4 pb-9">
            <SentArt />
            <div className="flex flex-col items-center gap-4 px-10 pt-2">
              <h2 className="text-[28px] leading-[34.5px] font-semibold tracking-[-0.6px] text-heading">
                Message sent
              </h2>
              <p className="text-center text-sm leading-[21px] text-body-soft">
                Thank you for contacting us! We will get back to you with an answer within 48 hours.
              </p>
              <div className="w-full max-w-[460px] rounded-[14px] border border-dashed border-border bg-faq-row px-4 py-3 text-left">
                <p className="text-xs leading-[18px] text-muted-foreground">Ticket</p>
                <p className="text-sm leading-[21px] break-words text-foreground">
                  <strong className="font-bold">#{receipt.ticket}</strong> · {receipt.topic}
                  {receipt.website && ` · ${receipt.website}`}
                </p>
              </div>
              <div className="flex w-full items-center justify-between gap-2">
                <Button variant="secondary" onClick={writeAnother}>
                  Write another message
                </Button>
                <Button asChild>
                  <Link href="/websites">Back to My Websites</Link>
                </Button>
              </div>
            </div>
            <button
              type="button"
              aria-label="Close"
              onClick={() => setDismissed(state)}
              className="absolute top-[15px] right-[15px] flex size-9 items-center justify-center rounded-[18px] bg-background/90 text-foreground shadow-[0_2px_6px_rgb(60_120_207/0.1)] outline-none transition-colors hover:bg-background focus-visible:ring-3 focus-visible:ring-ring/40"
            >
              <CloseCircle variant="Outline" aria-hidden className="size-4" />
            </button>
          </div>
        )}
      </Modal>
    </>
  );
}
