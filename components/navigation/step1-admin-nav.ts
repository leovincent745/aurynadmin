import {
  Activity,
  BarChart3,
  Bot,
  Boxes,
  CalendarDays,
  ClipboardCheck,
  ClipboardList,
  FlaskConical,
  GitBranch,
  HeartPulse,
  ListChecks,
  MessageSquare,
  PackageSearch,
  ScrollText,
  ShieldCheck,
  Stethoscope,
  Users,
  WandSparkles,
  type LucideIcon,
} from "lucide-react";

import type { AdminNavItem } from "@/components/layout/admin-shell";

export type AdminNavSection = "main" | "wellness" | "engagement" | "intelligence" | "admin";

type NavDefinition = {
  label: string;
  icon: LucideIcon;
  section: AdminNavSection;
  availability: "active" | "future";
  href?: string;
};

/** Single source of truth — deck sidebar layout, Step 1 routes only where active. */
const NAV_DEFINITIONS: NavDefinition[] = [
  { label: "Dashboard", icon: BarChart3, section: "main", href: "/dashboard", availability: "active" },

  { label: "Root Pathways", icon: GitBranch, section: "wellness", availability: "future" },
  { label: "Pathway Library", icon: HeartPulse, section: "wellness", availability: "future" },
  { label: "Plans & Protocols", icon: ClipboardCheck, section: "wellness", availability: "future" },
  { label: "Products", icon: Boxes, section: "wellness", availability: "future" },
  { label: "Ingredients", icon: PackageSearch, section: "wellness", availability: "future" },
  { label: "Interactions", icon: Activity, section: "wellness", availability: "future" },
  { label: "Rules Engine", icon: ClipboardCheck, section: "wellness", availability: "future" },

  {
    label: "Prompt System",
    icon: WandSparkles,
    section: "intelligence",
    href: "/prompt-system",
    availability: "active",
  },
  {
    label: "Test Chat",
    icon: FlaskConical,
    section: "intelligence",
    href: "/test-chat",
    availability: "active",
  },
  {
    label: "AI Logs",
    icon: ClipboardList,
    section: "intelligence",
    href: "/ai-optimization-center",
    availability: "active",
  },
  {
    label: "Advanced AI Optimization",
    icon: Bot,
    section: "intelligence",
    availability: "future",
  },

  {
    label: "Conversations",
    icon: MessageSquare,
    section: "engagement",
    href: "/conversations",
    availability: "active",
  },
  { label: "Users", icon: Users, section: "engagement", href: "/users", availability: "active" },
  { label: "Journeys", icon: GitBranch, section: "engagement", availability: "future" },
  { label: "Assessments", icon: ListChecks, section: "engagement", availability: "future" },
  { label: "Follow Ups", icon: CalendarDays, section: "engagement", availability: "future" },
  { label: "Communications", icon: MessageSquare, section: "engagement", availability: "future" },

  {
    label: "Version History",
    icon: ScrollText,
    section: "admin",
    href: "/admin/instructions/history",
    availability: "active",
  },
  {
    label: "Physician Governance",
    icon: Stethoscope,
    section: "admin",
    availability: "future",
  },
  { label: "Settings", icon: ShieldCheck, section: "admin", availability: "future" },
];

function isNavItemActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") {
    return pathname === "/dashboard" || pathname === "/admin";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function getStep1AdminNavItems(pathname: string): AdminNavItem[] {
  return NAV_DEFINITIONS.map((item) => ({
    label: item.label,
    icon: item.icon,
    section: item.section,
    href: item.availability === "active" ? item.href : undefined,
    availability: item.availability,
    active: item.href ? isNavItemActive(pathname, item.href) : false,
  }));
}

const BREADCRUMB_MAP: Record<string, string[]> = {
  "/dashboard": ["Main", "Dashboard"],
  "/admin": ["Main", "Dashboard"],
  "/prompt-system": ["Intelligence", "Prompt System"],
  "/test-chat": ["Intelligence", "Test Chat"],
  "/ai-optimization-center": ["Intelligence", "AI Logs"],
  "/conversations": ["Engagement", "Conversations"],
  "/users": ["Engagement", "Users"],
  "/admin/instructions/history": ["Admin", "Version History"],
};

export function getStep1AdminBreadcrumbs(pathname: string): string[] {
  const exact = BREADCRUMB_MAP[pathname];
  if (exact) return exact;

  if (pathname.startsWith("/conversations/")) {
    return ["Engagement", "Conversations", "Detail"];
  }
  if (pathname.startsWith("/users/")) {
    return ["Engagement", "Users", "Detail"];
  }

  return ["Auryn Admin"];
}

/** @deprecated Use getStep1AdminNavItems */
export const getPromptNavItems = getStep1AdminNavItems;

/** @deprecated Use getStep1AdminBreadcrumbs */
export const getPromptBreadcrumbs = getStep1AdminBreadcrumbs;

/** @deprecated Use getStep1AdminBreadcrumbs */
export const getAdminBreadcrumbs = getStep1AdminBreadcrumbs;
