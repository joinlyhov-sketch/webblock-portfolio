// Sidebar items. No count badges.

/** Icon names, mapped to iconsax icons in components/layout/sidebar-nav.tsx. */
export type NavIcon =
  | "overview"
  | "users"
  | "websites"
  | "subscriptions"
  | "monitoring"
  | "templates"
  | "settings"
  | "products"
  | "info";

export type NavItem = {
  label: string;
  href: string;
  /** Only active on this exact path (for section roots like /admin). */
  exact?: boolean;
  icon?: NavIcon;
  /** Sub-pages shown under the item; the item itself is then a group toggle, not a link. */
  children?: NavItem[];
};

export const userNav: NavItem[] = [
  { label: "Websites", href: "/websites", icon: "websites" },
  { label: "Templates", href: "/templates", icon: "templates" },
  { label: "Settings", href: "/settings", icon: "settings" },
];

export function ownerNav(websiteId: string): NavItem[] {
  const base = `/portal/${websiteId}`;
  return [
    { label: "Products", href: `${base}/products`, icon: "products" },
    { label: "Business info", href: `${base}/info`, icon: "info" },
    { label: "Monitoring", href: `${base}/monitoring`, icon: "monitoring" },
  ];
}

// Notifications open from the header bell; plans are managed from Subscriptions.
export const adminNav: NavItem[] = [
  { label: "Overview", href: "/admin", exact: true, icon: "overview" },
  { label: "User Accounts", href: "/admin/users", icon: "users" },
  { label: "User Websites", href: "/admin/websites", icon: "websites" },
  { label: "Subscriptions", href: "/admin/subscriptions", icon: "subscriptions" },
  {
    label: "Monitoring",
    href: "/admin/monitoring",
    icon: "monitoring",
    children: [
      { label: "Pipeline & Generation", href: "/admin/monitoring/pipeline" },
      { label: "Activity Log", href: "/admin/monitoring/activity" },
    ],
  },
];
