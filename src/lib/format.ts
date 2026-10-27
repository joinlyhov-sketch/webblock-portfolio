// Formatting at render time. API values stay raw (price as string, dates as ISO-8601 UTC).

export type Currency = "USD" | "KHR";

/** Dates are shown in Cambodia time, so server and client render the same text. */
const TIME_ZONE = "Asia/Phnom_Penh";

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const khr = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

/** "4.5" USD → "$4.50" · "18000" KHR → "18,000៛" */
export function formatPrice(price: string, currency: Currency): string {
  const amount = Number(price);
  return currency === "USD" ? usd.format(amount) : `${khr.format(amount)}៛`;
}

const date = new Intl.DateTimeFormat("en-US", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "short",
  day: "numeric",
});

const time = new Intl.DateTimeFormat("en-US", {
  timeZone: TIME_ZONE,
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

/** "2026-10-23T08:30:00Z" → "Oct 23, 2026" */
export function formatDate(iso: string): string {
  return date.format(new Date(iso));
}

/** "2026-10-23T08:30:00Z" → "3:30 PM" */
export function formatTime(iso: string): string {
  return time.format(new Date(iso));
}

/** "2026-10-23T08:30:00Z" → "Oct 23, 2026, 3:30 PM" */
export function formatDateTime(iso: string): string {
  return `${formatDate(iso)}, ${formatTime(iso)}`;
}

const month = new Intl.DateTimeFormat("en-US", { timeZone: TIME_ZONE, month: "short" });

/** "2026-10-01T00:00:00Z" → "Oct" */
export function formatMonth(iso: string): string {
  return month.format(new Date(iso));
}

/** "Just now", "12m ago", "2h ago", then the date. `now` is injectable for tests. */
export function formatRelative(iso: string, now: Date = new Date()): string {
  const minutes = Math.floor((now.getTime() - new Date(iso).getTime()) / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (minutes < 24 * 60) return `${Math.floor(minutes / 60)}h ago`;
  return formatDate(iso);
}

/** 126 → "2m 06s" · 47 → "47s" */
export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m ? `${m}m ${String(s).padStart(2, "0")}s` : `${s}s`;
}

const usdWhole = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

/** Like formatPrice but drops ".00" on whole amounts, for headline numbers: "14920.00" → "$14,920" · "19.99" → "$19.99" */
export function formatPriceShort(price: string, currency: Currency): string {
  const amount = Number(price);
  return currency === "USD" && Number.isInteger(amount) ? usdWhole.format(amount) : formatPrice(price, currency);
}

/** Notification style: "Just now", "2 mins ago", "1 hour ago", "Yesterday", "3 days ago", then the date. */
export function formatTimeAgo(iso: string, now: Date = new Date()): string {
  const minutes = Math.floor((now.getTime() - new Date(iso).getTime()) / 60_000);
  const plural = (n: number, unit: string) => `${n} ${unit}${n === 1 ? "" : "s"} ago`;
  if (minutes < 1) return "Just now";
  if (minutes < 60) return plural(minutes, "min");
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return plural(hours, "hour");
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return plural(days, "day");
  return formatDate(iso);
}
