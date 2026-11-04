/** Mock api.ts only: short pause when ms > 0. Defaults to 0 for snappy responses. */
export function delay(ms = 0): Promise<void> {
  if (ms <= 0) return Promise.resolve();
  return new Promise((resolve) => setTimeout(resolve, ms));
}
