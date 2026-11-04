"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { CONTACT_HASH } from "../content";

// The form and its validation (zod) stay out of the first page load: the popup starts closed.
const loadContactForm = () => import("./contact-form");
const ContactModal = dynamic(() => loadContactForm().then((m) => m.ContactModal), { ssr: false });

/** Opens when the URL hash is `#contact-form`; closing clears the hash so the same link opens it again. */
function useContactHash(): [boolean, () => void] {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const sync = () => setOpen(window.location.hash === CONTACT_HASH);
    const openFromLink = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      const link = event.target.closest<HTMLAnchorElement>("a[href]");
      if (!link) return;
      const target = new URL(link.href, window.location.href);
      if (target.hash === CONTACT_HASH) setOpen(true);
    };

    sync();
    window.addEventListener("hashchange", sync);
    window.addEventListener("popstate", sync);
    document.addEventListener("click", openFromLink, true);
    return () => {
      window.removeEventListener("hashchange", sync);
      window.removeEventListener("popstate", sync);
      document.removeEventListener("click", openFromLink, true);
    };
  }, []);

  function close() {
    setOpen(false);
    if (window.location.hash === CONTACT_HASH) {
      history.replaceState(history.state, "", window.location.pathname + window.location.search);
    }
  }

  return [open, close];
}

/** Fetches the form once the page is idle, so the first open is still instant. */
function usePrefetchWhenIdle() {
  useEffect(() => {
    const prefetch = () => void loadContactForm();
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(prefetch, { timeout: 5000 });
      return () => window.cancelIdleCallback(id);
    }
    const id = window.setTimeout(prefetch, 3000);
    return () => window.clearTimeout(id);
  }, []);
}

/**
 * "Talk to us" popup on the landing, privacy and terms pages: name, email and message, sent to
 * `/api/contact`. The navbar points to the landing CTA; email and "Mail to us" links open this popup.
 */
export function ContactDialog() {
  const [open, close] = useContactHash();
  // Mounted from the first open on, so the closing animation can still play.
  const [used, setUsed] = useState(false);
  usePrefetchWhenIdle();

  if (open && !used) setUsed(true);
  if (!used) return null;
  return <ContactModal open={open} onClose={close} />;
}
