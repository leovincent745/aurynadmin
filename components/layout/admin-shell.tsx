"use client";

import { useState } from "react";
import {
  Bell,
  ChevronRight,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { UserMenu } from "./user-menu";


export interface AdminNavItem {
  label: string;
  icon: LucideIcon;
  active?: boolean;
  href?: string;
  section: "main" | "wellness" | "intelligence" | "orchestration" | "engagement" | "admin";
}

interface AdminShellProps {
  navItems: AdminNavItem[];
  children: React.ReactNode;
  breadcrumbs?: string[];
}

const navSections = [
  { id: "main", label: "Main" },
  { id: "wellness", label: "Wellness Engine" },
  { id: "intelligence", label: "Intelligence" },
  { id: "orchestration", label: "Orchestration" },
  { id: "engagement", label: "Engagement" },
  { id: "admin", label: "Admin" },
] as const;

export function AdminShell({
  navItems,
  children,
  breadcrumbs = ["Root Pathways", "GLP-1 Support"],
}: AdminShellProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <main className="h-screen overflow-hidden bg-[#f7f9fc] text-slate-950">
      <div className="flex h-screen overflow-hidden">
        <aside
          className={`hidden h-screen shrink-0 flex-col overflow-hidden bg-[#071b35] text-slate-200 transition-[width] duration-200 md:flex ${
            isSidebarCollapsed ? "w-20" : "w-64"
          }`}
        >
          <div className="shrink-0 border-b border-white/10 px-3 py-4">
            <div
              className={`flex items-center gap-3 ${
                isSidebarCollapsed ? "justify-center" : "justify-between"
              }`}
            >
              <AurynLogo collapsed={isSidebarCollapsed} />
              <Button
                size="icon"
                variant="ghost"
                aria-label="Toggle sidebar"
                className="h-10 w-10 shrink-0 text-slate-300 hover:bg-white/10 hover:text-white"
                onClick={() => setIsSidebarCollapsed((value) => !value)}
                type="button"
              >
                {isSidebarCollapsed ? (
                  <PanelLeftOpen className="h-5 w-5" />
                ) : (
                  <PanelLeftClose className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>

          <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
            {navSections.map((section) => {
              const sectionItems = navItems.filter((item) => item.section === section.id);

              if (sectionItems.length === 0) {
                return null;
              }

              return (
                <div key={section.id}>
                  {!isSidebarCollapsed ? (
                    <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      {section.label}
                    </p>
                  ) : null}
                  <div className="space-y-1">
                    {sectionItems.map((item) => {
                      const navClassName = `h-10 w-full rounded-md text-sm font-medium ${
                        isSidebarCollapsed ? "justify-center px-0" : "justify-start gap-3 px-3"
                      } ${
                        item.active
                          ? "bg-violet-600 text-white hover:bg-violet-600 hover:text-white"
                          : "text-slate-300 hover:bg-white/10 hover:text-white"
                      }`;

                      const content = (
                        <>
                          <item.icon className="h-4 w-4 shrink-0" />
                          {!isSidebarCollapsed ? item.label : null}
                        </>
                      );

                      if (item.href) {
                        return (
                          <Button
                            key={item.label}
                            asChild
                            variant="ghost"
                            className={navClassName}
                            title={isSidebarCollapsed ? item.label : undefined}
                          >
                            <Link href={item.href}>{content}</Link>
                          </Button>
                        );
                      }

                      return (
                        <Button
                          key={item.label}
                          variant="ghost"
                          className={navClassName}
                          title={isSidebarCollapsed ? item.label : undefined}
                          type="button"
                        >
                          {content}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </nav>

          <div className="shrink-0 border-t border-white/10 p-3">
            <Button
              variant="ghost"
              className={`h-10 w-full text-slate-300 hover:bg-white/10 hover:text-white ${
                isSidebarCollapsed ? "justify-center px-0" : "justify-start gap-3"
              }`}
              onClick={() => setIsSidebarCollapsed((value) => !value)}
              type="button"
            >
              <Settings className="h-4 w-4 shrink-0" />
              {!isSidebarCollapsed ? "Collapse" : null}
            </Button>
          </div>
        </aside>

        <section className="flex h-screen min-w-0 flex-1 flex-col overflow-hidden">
          <header className="flex min-h-16 shrink-0 items-center justify-between gap-3 border-b bg-white px-4 py-3 sm:px-6">
            <div className="flex min-w-0 flex-wrap items-center gap-2 text-sm font-medium text-slate-600 sm:gap-3">
              <Button
                size="icon"
                variant="outline"
                aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                className="md:hidden"
                onClick={() => setIsSidebarCollapsed((value) => !value)}
                type="button"
              >
                <Menu className="h-4 w-4" />
              </Button>
              {breadcrumbs.map((breadcrumb, index) => (
                <div key={breadcrumb} className="flex min-w-0 items-center gap-2 sm:gap-3">
                  {index > 0 ? <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" /> : null}
                  <span
                    className={`break-words ${
                      index === breadcrumbs.length - 1 ? "text-slate-950" : ""
                    }`}
                  >
                    {breadcrumb}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex shrink-0 items-center gap-2 sm:gap-4">
              <Button size="icon" variant="outline" aria-label="Notifications" className="relative">
                <Bell className="h-4 w-4" />
                <span className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-rose-500 text-[10px] font-semibold text-white">
                  6
                </span>
              </Button>

              <UserMenu />
            </div>
          </header>

          {!isSidebarCollapsed ? (
          <div className="shrink-0 border-b bg-white px-4 py-3 md:hidden">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {navItems
                .filter((item): item is AdminNavItem & { href: string } => Boolean(item.href))
                .map((item) => {
                  const navClassName = `h-auto min-h-10 justify-start gap-2 rounded-md px-3 py-2 text-left text-xs font-medium ${
                    item.active
                      ? "bg-violet-600 text-white hover:bg-violet-600 hover:text-white"
                      : "border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-950"
                  }`;

                  return (
                    <Button
                      key={item.label}
                      asChild
                      variant={item.active ? "default" : "ghost"}
                      className={navClassName}
                    >
                      <Link href={item.href}>
                        <item.icon className="h-4 w-4 shrink-0" />
                        <span className="break-words">{item.label}</span>
                      </Link>
                    </Button>
                  );
                })}
            </div>
          </div>
          ) : null}

          <div className="flex-1 space-y-6 overflow-y-auto p-4 sm:p-6">{children}</div>
        </section>
      </div>
    </main>
  );
}

function AurynLogo({ collapsed }: { collapsed: boolean }) {
  return (
    <div className={`flex min-w-0 items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
      <div className={`relative shrink-0 ${collapsed ? "h-7 w-7" : "h-10 w-10"}`}>
        <span className={`absolute rounded-full bg-violet-400 shadow-[0_0_18px_rgba(139,92,246,0.45)] ${collapsed ? "left-3 top-0 h-3.5 w-2" : "left-4 top-0 h-5 w-2.5"}`} />
        <span className={`absolute rounded-full bg-cyan-400 shadow-[0_0_18px_rgba(34,211,238,0.35)] ${collapsed ? "bottom-0 left-3 h-3.5 w-2" : "left-4 bottom-0 h-5 w-2.5"}`} />
        <span className={`absolute rounded-full bg-blue-500 shadow-[0_0_18px_rgba(59,130,246,0.35)] ${collapsed ? "left-0 top-3 h-2 w-3.5" : "left-0 top-4 h-2.5 w-5"}`} />
        <span className={`absolute rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.35)] ${collapsed ? "right-0 top-3 h-2 w-3.5" : "right-0 top-4 h-2.5 w-5"}`} />
        <span className={`absolute rounded-full bg-white/90 ${collapsed ? "left-[10px] top-[10px] h-2 w-2" : "left-[15px] top-[15px] h-2.5 w-2.5"}`} />
      </div>
      {!collapsed ? (
        <div className="min-w-0">
          <p className="text-2xl font-semibold tracking-[0.2em] text-white">AURYN</p>
          <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            Wellness Intelligence
          </p>
        </div>
      ) : null}
    </div>
  );
}
