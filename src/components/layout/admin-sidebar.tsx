import { adminNav } from "@/config/nav";
import { Avatar } from "@/components/common/avatar";
import { SidebarNav } from "./sidebar-nav";
import { SidebarShell } from "./sidebar-shell";

type SidebarUser = {
  fullName: string;
  email: string;
  avatarUrl: string | null;
};

export function AdminSidebar({ user }: { user: SidebarUser }) {
  return (
    <SidebarShell
      label="Admin Portal"
      homeHref="/admin"
      compact
      footer={
        <div className="flex items-center gap-2.5 px-2 py-1.5">
          <Avatar name={user.fullName} src={user.avatarUrl} />
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold text-foreground">
              {user.fullName}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {user.email}
            </p>
          </div>
        </div>
      }
    >
      <SidebarNav items={adminNav} compact />
    </SidebarShell>
  );
}
