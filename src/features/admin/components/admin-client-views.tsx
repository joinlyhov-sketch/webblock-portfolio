"use client";

import dynamic from "next/dynamic";
import { DashboardSkeleton, TableSkeleton } from "@/components/common/page-skeleton";

// Keep admin screen rendering in the browser; protected pages supply serializable data.
export const OverviewView = dynamic(() => import("./overview-view").then((module) => module.OverviewView), {
  ssr: false,
  loading: () => <DashboardSkeleton admin />,
});

export const UsersView = dynamic(() => import("./users-view").then((module) => module.UsersView), {
  ssr: false,
  loading: () => <TableSkeleton stats={4} />,
});

export const WebsitesView = dynamic(() => import("./websites-view").then((module) => module.WebsitesView), {
  ssr: false,
  loading: () => <TableSkeleton />,
});

export const SubscriptionsView = dynamic(() => import("./subscriptions-view").then((module) => module.SubscriptionsView), {
  ssr: false,
  loading: () => <TableSkeleton stats={4} />,
});

export const PlansView = dynamic(() => import("./plans-view").then((module) => module.PlansView), {
  ssr: false,
  loading: () => <TableSkeleton compact />,
});

export const NotificationsView = dynamic(() => import("./notifications-view").then((module) => module.NotificationsView), {
  ssr: false,
  loading: () => <TableSkeleton compact />,
});

export const PipelineView = dynamic(() => import("../monitoring/components/pipeline-view").then((module) => module.PipelineView), {
  ssr: false,
  loading: () => <TableSkeleton />,
});

export const ActivityView = dynamic(() => import("../monitoring/components/activity-view").then((module) => module.ActivityView), {
  ssr: false,
  loading: () => <TableSkeleton />,
});
