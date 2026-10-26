/** For mock api.ts only: wait 200–400 ms so loading states are visible. Delete with the mocks. */
export function mockDelay(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 200 + Math.random() * 200));
}
