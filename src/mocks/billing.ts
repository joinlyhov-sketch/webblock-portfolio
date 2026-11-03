/** How long a KHQR code stays valid. */
export const QR_LIFETIME_MS = 10 * 60_000;

/** MOCK ONLY: the real backend confirms the payment when the bank does. */
export const MOCK_AUTO_PAY_MS = 8_000;

export const MOCK_QR_IMAGE_URL = "/images/billing/khqr-code.jpg";
