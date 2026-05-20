import {
  BarChart3,
  Bot,
  GitBranch,
  PackageSearch,
  Route,
  WandSparkles,
  Workflow,
} from "lucide-react";

import type { AdminNavItem } from "@/components/layout/admin-shell";

export const pathwayNavItems: AdminNavItem[] = [
  { label: "Dashboard", icon: BarChart3, section: "main", href: "/" },
  {
    label: "Root Pathways",
    icon: GitBranch,
    section: "wellness",
    href: "/root-pathways/glp-1-support",
    active: true,
  },
  {
    label: "Ingredients Intelligence",
    icon: PackageSearch,
    section: "wellness",
    href: "/ingredients-intelligence",
  },
  {
    label: "AI Optimization Center",
    icon: Bot,
    section: "intelligence",
    href: "/ai-optimization-center",
  },
  { label: "Prompt System", icon: WandSparkles, section: "intelligence", href: "/prompt-system" },
  {
    label: "Journey Builder",
    icon: Workflow,
    section: "orchestration",
    href: "/journey-builder",
  },
  {
    label: "Live User Journey",
    icon: Route,
    section: "orchestration",
    href: "/live-user-journey",
  },
  // Future menus. Enable these when their pages are created.
  // { label: "Pathway Library", icon: HeartPulse, section: "wellness" },
  // { label: "Products", icon: Boxes, section: "wellness" },
  // { label: "Ingredients", icon: PackageSearch, section: "wellness" },
  // { label: "Interactions", icon: Activity, section: "wellness" },
  // { label: "Rules Engine", icon: ClipboardCheck, section: "wellness" },
  // { label: "Users", icon: Users, section: "engagement" },
  // { label: "Journeys", icon: GitBranch, section: "engagement" },
  // { label: "Assessments", icon: ListChecks, section: "engagement" },
  // { label: "Follow Ups", icon: CalendarDays, section: "engagement" },
  // { label: "Communications", icon: MessageSquare, section: "engagement" },
  // { label: "Analytics", icon: BarChart3, section: "intelligence" },
  // { label: "Reports", icon: FileBarChart, section: "intelligence" },
  // { label: "Physicians", icon: Stethoscope, section: "admin" },
  // { label: "Administrators", icon: UserCog, section: "admin" },
  // { label: "Settings", icon: ShieldCheck, section: "admin" },
];

export const pathwayTabs = [
  "Overview",
  "Funnel Flow",
  "Education",
  "Quick Actions",
  "Plans & Protocols",
  "Ingredients",
  "Optimization Rules",
  "AI Instructions",
  "Personalization",
  "Follow-Up Timeline",
  "Analytics",
  "Self Learning",
  "Physician Review",
  "Activity Logs",
];
