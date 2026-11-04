"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { AdminNotification, AdminProfile } from "../types";

type AdminClientData = {
  profile: AdminProfile;
  notifications: AdminNotification[];
};

const AdminContext = createContext<AdminClientData | null>(null);

export function AdminClientProvider({ children, ...data }: AdminClientData & { children: ReactNode }) {
  return <AdminContext.Provider value={data}>{children}</AdminContext.Provider>;
}

export function useAdminClientData() {
  const data = useContext(AdminContext);
  if (!data) throw new Error("Admin screens require AdminClientProvider.");
  return data;
}
