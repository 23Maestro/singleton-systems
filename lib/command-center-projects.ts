import type { Lane, WorkItem } from "./command-center";

// Dashboard-owned projects do not create a new Lane or external destination.
export const HOME_ADMIN_PROJECT = { id: "home-admin", name: "Home Admin" } as const;
export function isDashboardProject(id: string): boolean {
  return id === "dashboard" || id === HOME_ADMIN_PROJECT.id;
}

export type DashboardLane = Lane | "Home Admin";
export const HOME_ADMIN_COLOR = "#f58b32";
export function dashboardLane(item: Pick<WorkItem, "owner" | "projectId" | "lane">): DashboardLane {
  return item.owner === "dashboard" && item.projectId === HOME_ADMIN_PROJECT.id ? "Home Admin" : item.lane;
}
export function dashboardLaneLabel(lane: DashboardLane): string {
  return lane === "Development" ? "Dev Ops" : lane;
}
