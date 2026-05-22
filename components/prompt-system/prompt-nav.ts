import {
  BarChart3,
  Bot,
  Boxes,
  ClipboardCheck,
  GitBranch,
  HeartPulse,
  PackageSearch,
  WandSparkles,
} from "lucide-react";

import type { AdminNavItem } from "@/components/layout/admin-shell";

/** Original frontend navigation — only add hrefs where Step 1 has a wired screen. */
const baseNavItems: Omit<AdminNavItem, "active">[] = [
  { label: "Dashboard", icon: BarChart3, section: "main", href: "/dashboard" },
  {
    label: "Root Pathways",
    icon: GitBranch,
    section: "wellness",
    href: "/root-pathways/glp-1-support",
  },
  { label: "Pathway Library", icon: HeartPulse, section: "wellness" },
  { label: "Plans & Protocols", icon: ClipboardCheck, section: "wellness" },
  { label: "Products", icon: Boxes, section: "wellness" },
  { label: "Ingredients", icon: PackageSearch, section: "wellness" },
  { label: "Interactions", icon: GitBranch, section: "wellness" },
  { label: "Rules Engine", icon: ClipboardCheck, section: "wellness" },
  {
    label: "AI Optimization Center",
    icon: Bot,
    section: "intelligence",
    href: "/ai-optimization-center",
  },
  {
    label: "Prompt System",
    icon: WandSparkles,
    section: "intelligence",
    href: "/prompt-system",
  },
];

function isNavActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") {
    return pathname === "/dashboard";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function getPromptNavItems(pathname: string): AdminNavItem[] {
  return baseNavItems.map((item) => ({
    ...item,
    active: item.href ? isNavActive(pathname, item.href) : false,
  }));
}

const breadcrumbMap: Record<string, string[]> = {
  "/dashboard": ["Main", "Dashboard"],
  "/prompt-system": ["Intelligence", "Prompt System"],
  "/ai-optimization-center": ["Intelligence", "AI Optimization Center"],
  "/root-pathways/glp-1-support": ["Wellness Engine", "Root Pathways", "GLP-1 Support"],
  "/conversations": ["Operations", "Conversation Review"],
  "/users": ["Operations", "User Profiles"],
  "/test-chat": ["Intelligence", "Test Chat"],
};

export function getPromptBreadcrumbs(pathname: string): string[] {
  const exact = breadcrumbMap[pathname];
  if (exact) return exact;

  if (pathname.startsWith("/conversations/")) {
    return ["Operations", "Conversation Review", "Detail"];
  }
  if (pathname.startsWith("/users/")) {
    return ["Operations", "User Profiles", "Detail"];
  }

  return ["Auryn Admin"];
}
