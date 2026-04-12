import {
  BookOpen,
  CheckSquare,
  Sparkles,
  Trophy,
  UserRound,
  type LucideIcon,
} from "lucide-react";

export const brand = {
  name: "Atlas Fluency",
  shortName: "Atlas",
  workspaceLabel: "English performance studio",
  tagline: "Structured practice, live results, and AI coaching in one calm workspace.",
  authLabel: "Atlas Fluency access",
  adminLabel: "Atlas Control",
  supportLabel: "Learner operations",
} as const;

export interface WorkspaceNavItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

export const workspaceNavItems: WorkspaceNavItem[] = [
  { label: "Home", path: "/home", icon: Sparkles },
  { label: "Practice", path: "/task", icon: CheckSquare },
  { label: "Learn", path: "/learning", icon: BookOpen },
  { label: "Leaderboard", path: "/leaderboard", icon: Trophy },
  { label: "Profile", path: "/profile", icon: UserRound },
];

export const isWorkspaceRouteActive = (pathname: string, routePath: string) => {
  if (routePath === "/home") {
    return pathname === "/home";
  }

  return pathname === routePath || pathname.startsWith(`${routePath}/`);
};

export const getWorkspaceRouteLabel = (pathname: string) => {
  const matched = workspaceNavItems.find((item) => isWorkspaceRouteActive(pathname, item.path));
  return matched?.label;
};
