export type Weekday =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

/** `opensAt` / `closesAt` are 24-hour "HH:mm" strings. */
export type OpeningHour = {
  day: Weekday;
  open: boolean;
  opensAt: string;
  closesAt: string;
};

export type BusinessDetails = {
  businessName: string;
  businessType: string;
  description: string;
  logoUrl: string | null;
  phone: string;
  email: string;
  address: string;
  hours: OpeningHour[];
};
