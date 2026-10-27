// Sidebar items. No count badges.

export type NavIcon =
  | "websites"
  | "templates"
  | "settings"
  | "support"
  | "products"
  | "business"
  | "monitor";

export type NavItem = {
  label: string;
  href: string;
  /** Icon shown in the user and owner sidebars. The admin sidebar is text only. */
  icon?: NavIcon;
  /** Only active on this exact path (for section roots like /admin). */
  exact?: boolean;
};

export const userNav: NavItem[] = [
  { label: "My Websites", href: "/websites", icon: "websites" },
  { label: "Templates", href: "/templates", icon: "templates" },
  { label: "Settings", href: "/settings", icon: "settings" },
  { label: "Contact Support", href: "/support", icon: "support" },
];

export function ownerNav(websiteId: string): NavItem[] {
  const base = `/portal/${websiteId}`;
  return [
    { label: "Products", href: `${base}/products`, icon: "products" },
    { label: "Business information", href: `${base}/info`, icon: "business" },
    { label: "Monitor", href: `${base}/monitoring`, icon: "monitor" },
  ];
}

export const adminNav: NavItem[] = [
  { label: "Overview", href: "/admin", exact: true },
  { label: "Users", href: "/admin/users" },
  { label: "Websites", href: "/admin/websites" },
  { label: "Subscriptions", href: "/admin/subscriptions" },
  { label: "Plans", href: "/admin/plans" },
  { label: "Notifications", href: "/admin/notifications" },
  { label: "Pipeline", href: "/admin/monitoring/pipeline" },
  { label: "Activity", href: "/admin/monitoring/activity" },
];
