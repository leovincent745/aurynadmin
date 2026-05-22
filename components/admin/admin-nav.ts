import {
  BarChart3,
  ClipboardList,
  FlaskConical,
  MessageSquare,
  ScrollText,
  Users,
  WandSparkles,
} from "lucide-react";

import type { AdminNavItem } from "@/components/layout/admin-shell";

/** Step 1 admin navigation only — future deck modules are not listed. */
const step1NavItems: Omit<AdminNavItem, "active">[] = [
  { label: "Dashboard", icon: BarChart3, section: "main", href: "/admin" },
  { label: "AI Instructions", icon: WandSparkles, section: "main", href: "/admin/instructions" },
  {
    label: "Version History",
    icon: ScrollText,
    section: "main",
    href: "/admin/instructions/history",
  },
  { label: "Test Chat", icon: FlaskConical, section: "main", href: "/admin/test-chat" },
  { label: "Conversations", icon: MessageSquare, section: "main", href: "/admin/conversations" },
  { label: "AI Logs", icon: ClipboardList, section: "main", href: "/admin/ai-logs" },
  { label: "User Profiles", icon: Users, section: "main", href: "/admin/users" },
];

function isNavItemActive(pathname: string, href: string): boolean {
  if (href === "/admin") {
    return pathname === "/admin";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function getStep1AdminNavItems(pathname: string): AdminNavItem[] {
  return step1NavItems.map((item) => ({
    ...item,
    active: item.href ? isNavItemActive(pathname, item.href) : false,
  }));
}

export const step1Breadcrumbs: Record<string, string[]> = {
  "/admin": ["Admin", "Dashboard"],
  "/admin/instructions": ["Admin", "AI Instructions"],
  "/admin/instructions/history": ["Admin", "AI Instructions", "Version History"],
  "/admin/test-chat": ["Admin", "Test Chat"],
  "/admin/conversations": ["Admin", "Conversations"],
  "/admin/ai-logs": ["Admin", "AI Logs"],
  "/admin/users": ["Admin", "User Profiles"],
};

export function getAdminBreadcrumbs(pathname: string): string[] {
  const exact = step1Breadcrumbs[pathname];
  if (exact) return exact;

  if (pathname.startsWith("/admin/conversations/")) {
    return ["Admin", "Conversations", "Detail"];
  }
  if (pathname.startsWith("/admin/users/")) {
    return ["Admin", "User Profiles", "Detail"];
  }

  return ["Admin"];
}
