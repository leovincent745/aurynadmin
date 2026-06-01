import {
  Activity,
  BarChart3,
  Bot,
  Boxes,
  CalendarDays,
  ClipboardCheck,
  FlaskConical,
  GitBranch,
  HeartPulse,
  ListChecks,
  MessageSquare,
  PackageSearch,
  Route,
  ScrollText,
  ShieldCheck,
  Stethoscope,
  Users,
  WandSparkles,
  Workflow,
  type LucideIcon,
} from "lucide-react";

import type { AdminNavItem } from "@/components/layout/admin-shell";

export type AdminNavSection =
  | "main"
  | "wellness"
  | "engagement"
  | "intelligence"
  | "orchestration"
  | "admin";

type NavDefinition = {
  label: string;
  icon: LucideIcon;
  section: AdminNavSection;
  availability: "active" | "future";
  href?: string;
};

const NAV_DEFINITIONS: NavDefinition[] = [
  { label: "Dashboard", icon: BarChart3, section: "main", href: "/dashboard", availability: "active" },

  {
    label: "Root Pathways",
    icon: GitBranch,
    section: "wellness",
    href: "/root-pathways/glp-1-support",
    availability: "active",
  },
  { label: "Pathway Library", icon: HeartPulse, section: "wellness", availability: "future" },
  { label: "Plans & Protocols", icon: ClipboardCheck, section: "wellness", availability: "future" },
  { label: "Products", icon: Boxes, section: "wellness", availability: "future" },
  {
    label: "Ingredients",
    icon: PackageSearch,
    section: "wellness",
    href: "/ingredients-intelligence",
    availability: "active",
  },
  { label: "Interactions", icon: Activity, section: "wellness", availability: "future" },
  { label: "Rules Engine", icon: ClipboardCheck, section: "wellness", availability: "future" },

  {
    label: "AI Optimization Center",
    icon: Bot,
    section: "intelligence",
    href: "/ai-optimization-center",
    availability: "active",
  },
  {
    label: "Prompt System",
    icon: WandSparkles,
    section: "intelligence",
    href: "/prompt-system",
    availability: "active",
  },
  { label: "Analytics", icon: BarChart3, section: "intelligence", availability: "future" },
  { label: "AI Insights", icon: Bot, section: "intelligence", availability: "future" },
  { label: "Reports", icon: ScrollText, section: "intelligence", availability: "future" },
  { label: "Test Chat", icon: FlaskConical, section: "intelligence", href: "/test-chat", availability: "active" },

  {
    label: "Advanced Journey Builder",
    icon: Workflow,
    section: "orchestration",
    href: "/journey-builder",
    availability: "active",
  },
  {
    label: "Live User Journey",
    icon: Route,
    section: "orchestration",
    href: "/live-user-journey",
    availability: "active",
  },

  { label: "Users", icon: Users, section: "engagement", href: "/users", availability: "active" },
  { label: "Journeys", icon: GitBranch, section: "engagement", availability: "future" },
  { label: "Assessments", icon: ListChecks, section: "engagement", availability: "future" },
  { label: "Follow Ups", icon: CalendarDays, section: "engagement", availability: "future" },
  {
    label: "Communications",
    icon: MessageSquare,
    section: "engagement",
    href: "/conversations",
    availability: "active",
  },

  { label: "Physicians", icon: Stethoscope, section: "admin", availability: "future" },
  { label: "Administrators", icon: Users, section: "admin", availability: "future" },
  {
    label: "Version History",
    icon: ScrollText,
    section: "admin",
    href: "/admin/instructions/history",
    availability: "active",
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
  "/root-pathways/glp-1-support": ["Wellness Engine", "Root Pathways", "GLP-1 Support"],
  "/ingredients-intelligence": ["Wellness Engine", "Ingredients Intelligence"],
  "/ai-optimization-center": ["Intelligence", "AI Optimization Center"],
  "/prompt-system": ["Intelligence", "Prompt System"],
  "/test-chat": ["Intelligence", "Test Chat"],
  "/journey-builder": ["Orchestration", "Advanced Journey Builder"],
  "/live-user-journey": ["Orchestration", "Live User Journey"],
  "/conversations": ["Engagement", "Communications"],
  "/users": ["Engagement", "Users"],
  "/admin/instructions/history": ["Admin", "Version History"],
};

export function getStep1AdminBreadcrumbs(pathname: string): string[] {
  const exact = BREADCRUMB_MAP[pathname];
  if (exact) return exact;

  if (pathname.startsWith("/conversations/")) {
    return ["Engagement", "Communications", "Detail"];
  }

  if (pathname.startsWith("/users/")) {
    return ["Engagement", "Users", "Detail"];
  }

  return ["Auryn Admin"];
}

export const getPromptNavItems = getStep1AdminNavItems;
export const getPromptBreadcrumbs = getStep1AdminBreadcrumbs;
export const getAdminBreadcrumbs = getStep1AdminBreadcrumbs;
