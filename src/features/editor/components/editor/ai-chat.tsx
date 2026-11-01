"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { ArrowUp } from "iconsax-reactjs";
import { AiAvatar } from "@/components/common/ai-avatar";
import { toast } from "@/components/common/toast";
import { formatTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { askAiAction } from "../../actions";
import type { AiMessage } from "../../types";
import { useMedia } from "./editor-context";

const GREETING: AiMessage = {
  id: "greeting",
  role: "ASSISTANT",
  text: "Hi! Tell me what to change on your site, like “make the hero heading warmer” or “add a button to the About section”.",
  createdAt: "",
};

/** Figma "AI Agent tab": chat history (user bubbles right, AI replies left) and the prompt pill. */
export function AiChat() {
  const { websiteId } = useMedia();
  const [messages, setMessages] = useState<AiMessage[]>([GREETING]);
  const [prompt, setPrompt] = useState("");
  const [pending, startTransition] = useTransition();
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages, pending]);

  function send() {
    const text = prompt.trim();
    if (!text || pending) return;
    setMessages((current) => [
      ...current,
      { id: crypto.randomUUID(), role: "USER", text, createdAt: new Date().toISOString() },
    ]);
    setPrompt("");
    startTransition(async () => {
      const result = await askAiAction(websiteId, text);
      if (!result.ok) {
        toast.error("WebBlock AI couldn't answer", result.message);
        return;
      }
      setMessages((current) => [...current, result.data]);
    });
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div role="log" aria-label="WebBlock AI chat" aria-live="polite" className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 pt-3 pb-2">
        {/* Pushes the conversation to the bottom, next to the prompt, like a messaging app. */}
        <div aria-hidden className="flex-1" />
        {messages.map((message, index) => {
          const user = message.role === "USER";
          // Messages from the same sender sit close together; only the last one of a group gets the tail,
          // the avatar and the time.
          const startsGroup = messages[index - 1]?.role !== message.role;
          const endsGroup = messages[index + 1]?.role !== message.role && !(pending && !user);
          const showTime = endsGroup && message.createdAt !== "";
          return (
            <div
              key={message.id}
              className={cn(
                "group flex max-w-full items-end gap-2.5 motion-safe:animate-message-in",
                startsGroup ? "mt-4" : "mt-1",
                user ? "origin-bottom-right self-end pr-2" : "origin-bottom-left self-start",
              )}
            >
              {!user &&
                (endsGroup ? (
                  <AiAvatar className={showTime ? "mb-[22px]" : undefined} />
                ) : (
                  <span aria-hidden className="w-8 shrink-0" />
                ))}
              <div className={cn("flex min-w-0 flex-col gap-1.5", user ? "items-end" : "items-start")}>
                <p
                  className={cn(
                    "relative max-w-[250px] rounded-[20px] px-4 py-2.5 text-[13px] leading-5 break-words whitespace-pre-wrap",
                    user ? "bg-brand-strong text-primary-foreground" : "bg-segment text-foreground",
                    !startsGroup && (user ? "rounded-tr-[6px]" : "rounded-tl-[6px]"),
                    !endsGroup && (user ? "rounded-br-[6px]" : "rounded-bl-[6px]"),
                    endsGroup &&
                      (user
                        ? "before:absolute before:-right-2 before:bottom-0 before:h-4 before:w-4 before:rounded-bl-[16px] before:bg-brand-strong after:absolute after:-right-[10px] after:bottom-0 after:h-4 after:w-[10px] after:rounded-bl-[10px] after:bg-background"
                        : "before:absolute before:-left-2 before:bottom-0 before:h-4 before:w-4 before:rounded-br-[16px] before:bg-segment after:absolute after:-left-[10px] after:bottom-0 after:h-4 after:w-[10px] after:rounded-br-[10px] after:bg-background"),
                  )}
                >
                  {message.text}
                </p>
                {showTime && (
                  <div className="flex items-center gap-2 px-1">
                    <time dateTime={message.createdAt} className="text-[11px] leading-4 text-muted-foreground">
                      {formatTime(message.createdAt)}
                    </time>
                                      </div>
                )}
              </div>
            </div>
          );
        })}
        {pending && (
          <div className="mt-4 flex origin-bottom-left items-end gap-2.5 self-start motion-safe:animate-message-in">
            <AiAvatar />
            <p role="status" className="flex h-8 items-center gap-1 rounded-full border border-border bg-background px-3.5 shadow-button">
              <span className="sr-only">WebBlock AI is typing</span>
              {[0, 1, 2].map((dot) => (
                <span
                  key={dot}
                  aria-hidden
                  className="size-1 rounded-full bg-muted-foreground motion-safe:animate-typing-dot"
                  style={{ animationDelay: `${dot * 180}ms` }}
                />
              ))}
            </p>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form
        className="px-4 pt-3 pb-5"
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <div className="flex items-center gap-2 rounded-full border border-border bg-background py-1.5 pr-1.5 pl-[18px] shadow-card focus-within:border-brand">
          <input
            aria-label="Ask WebBlock AI"
            placeholder="Make the heading warmer…"
            value={prompt}
            maxLength={500}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-w-0 flex-1 bg-transparent text-[13px] leading-5 text-foreground outline-none placeholder:text-placeholder"
          />
          <button
            type="submit"
            aria-label="Send"
            disabled={!prompt.trim() || pending}
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-strong text-primary-foreground outline-none transition-colors hover:bg-brand-deep focus-visible:ring-3 focus-visible:ring-ring/40 disabled:opacity-50"
          >
            <ArrowUp aria-hidden className="size-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
}
