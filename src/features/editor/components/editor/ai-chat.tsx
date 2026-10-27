"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { ArrowUp } from "iconsax-reactjs";
import { toast } from "@/components/common/toast";
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
      <div role="log" aria-label="WebBlock AI chat" aria-live="polite" className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 pt-3 pb-2">
        {messages.map((message) => (
          <p
            key={message.id}
            className={cn(
              "max-w-[268px] rounded-[20px] px-4 py-2.5 text-[13px] leading-5 break-words whitespace-pre-wrap",
              message.role === "USER" ? "self-end bg-brand-strong text-primary-foreground" : "self-start bg-segment text-foreground",
            )}
          >
            {message.text}
          </p>
        ))}
        {pending && (
          <p className="self-start rounded-[20px] bg-segment px-4 py-2.5 text-[13px] leading-5 text-muted-foreground">
            Thinking…
          </p>
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
