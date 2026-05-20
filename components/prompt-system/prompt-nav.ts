import {
  BarChart3,
  Bot,
  GitBranch,
  Route,
  Workflow,
  PackageSearch,
  WandSparkles,
} from "lucide-react";

import type { AdminNavItem } from "@/components/layout/admin-shell";

export const promptSystemNavItems: AdminNavItem[] = [
  { label: "Dashboard", icon: BarChart3, section: "main", href: "/" },
  {
    label: "Root Pathways",
    icon: GitBranch,
    section: "wellness",
    href: "/root-pathways/glp-1-support",
  },
  {
    label: "Prompt System",
    icon: WandSparkles,
    section: "intelligence",
    href: "/prompt-system",
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
  // { label: "Plans & Protocols", icon: ClipboardCheck, section: "wellness" },
  // { label: "Products", icon: Boxes, section: "wellness" },
  // { label: "Ingredients", icon: PackageSearch, section: "wellness" },
  // { label: "Interactions", icon: GitBranch, section: "wellness" },
  // { label: "Rules Engine", icon: ClipboardCheck, section: "wellness" },
  // { label: "AI Optimization Center", icon: Bot, section: "intelligence" },
  // { label: "Pipeline Monitoring", icon: BarChart3, section: "intelligence" },
  // { label: "Validation Engine", icon: ShieldCheck, section: "intelligence" },
  // { label: "AI Governance", icon: ShieldCheck, section: "intelligence" },
  // { label: "Users", icon: Users, section: "engagement" },
  // { label: "Journeys", icon: GitBranch, section: "engagement" },
  // { label: "Assessments", icon: ListChecks, section: "engagement" },
  // { label: "Communications", icon: MessageSquare, section: "engagement" },
  // { label: "Physicians", icon: Stethoscope, section: "admin" },
  // { label: "Administrators", icon: UserCog, section: "admin" },
  // { label: "Settings", icon: Settings, section: "admin" },
];
