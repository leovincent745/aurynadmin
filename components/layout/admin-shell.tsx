"use client";

import { useState } from "react";
import { Bell, ChevronRight, Menu, Settings, type LucideIcon } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { UserMenu } from "./user-menu";

export type AdminNavAvailability = "active" | "future";

export interface AdminNavItem {
  label: string;
  icon: LucideIcon;
  active?: boolean;
  href?: string;
  section: "main" | "wellness" | "engagement" | "intelligence" | "orchestration" | "admin";
  availability?: AdminNavAvailability;
}

interface AdminShellProps {
  navItems: AdminNavItem[];
  children: React.ReactNode;
  breadcrumbs?: string[];
}

const navSections = [
  { id: "main", label: "Main" },
  { id: "wellness", label: "Wellness Engine" },
  { id: "engagement", label: "Engagement" },
  { id: "intelligence", label: "Intelligence" },
  { id: "orchestration", label: "Orchestration" },
  { id: "admin", label: "Admin" },
] as const;

export function AdminShell({
  navItems,
  children,
  breadcrumbs = ["Root Pathways", "GLP-1 Support"],
}: AdminShellProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <main className="h-dvh overflow-hidden bg-[#f7f9fc] text-slate-950">
      <div className="flex h-dvh overflow-hidden">
        <aside
          className={`flex h-dvh shrink-0 flex-col bg-[#071b35] text-slate-200 transition-[width] duration-200 ${
            collapsed ? "w-16" : "w-64"
          }`}
        >
          <div className="shrink-0 border-b border-white/10 px-3 py-4">
            <div className={`flex items-center ${collapsed ? "justify-center" : "justify-between gap-3"}`}>
              <Link
                href="/dashboard"
                className={collapsed ? "hidden" : "flex min-w-0 items-center gap-3 rounded-lg outline-none ring-violet-400 focus-visible:ring-2"}
              >
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-500/15 text-blue-200">
                  <span className="text-xl font-semibold">A</span>
                </div>
                <div className="min-w-0">
                  <p className="text-xl font-semibold tracking-[0.22em] text-white">AURYN</p>
                  <p className="text-[10px] uppercase tracking-[0.16em] text-slate-400">
                    Wellness Intelligence
                  </p>
                </div>
              </Link>

              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 shrink-0 text-slate-300 hover:bg-white/10 hover:text-white"
                type="button"
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                onClick={() => setCollapsed((value) => !value)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <nav className="min-h-0 flex-1 space-y-5 overflow-y-auto px-3 py-5 [scrollbar-color:rgba(148,163,184,0.55)_transparent] [scrollbar-gutter:stable] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-400/60 [&::-webkit-scrollbar-track]:bg-transparent">
            {navSections.map((section) => {
              const sectionItems = navItems.filter((item) => item.section === section.id);

              if (sectionItems.length === 0) {
                return null;
              }

              return (
                <div key={section.id}>
                  <p
                    className={`mb-2 px-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500 ${
                      collapsed ? "sr-only" : ""
                    }`}
                  >
                    {section.label}
                  </p>
                  <div className="space-y-1">
                    {sectionItems.map((item) => {
                      const isFuture = item.availability === "future" || !item.href;
                      const navClassName = `h-10 w-full rounded-md px-3 text-sm font-medium ${
                        item.active
                          ? "bg-violet-600 text-white hover:bg-violet-600 hover:text-white"
                          : isFuture
                            ? "cursor-not-allowed text-slate-500 hover:bg-transparent hover:text-slate-500"
                            : "text-slate-300 hover:bg-white/10 hover:text-white"
                      } ${collapsed ? "justify-center" : "justify-start gap-3"}`;

                      const content = (
                        <>
                          <item.icon className="h-4 w-4 shrink-0" />
                          <span className={collapsed ? "sr-only" : "truncate"}>{item.label}</span>
                          {isFuture && !collapsed ? (
                            <span className="ml-auto shrink-0 text-[9px] font-semibold uppercase tracking-wide text-slate-600">
                              Soon
                            </span>
                          ) : null}
                        </>
                      );

                      if (item.href && !isFuture) {
                        return (
                          <Button
                            key={item.label}
                            asChild
                            variant="ghost"
                            className={navClassName}
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
                          type="button"
                          disabled={isFuture}
                          title={isFuture ? "Available in a future release" : undefined}
                          aria-disabled={isFuture}
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
                collapsed ? "justify-center px-0" : "justify-start gap-3"
              }`}
            >
              <Settings className="h-4 w-4" />
              <span className={collapsed ? "sr-only" : ""}>Settings</span>
            </Button>
          </div>
        </aside>

        <section className="flex h-dvh min-w-0 flex-1 flex-col overflow-hidden bg-[#f7f9fc]">
          <header className="flex min-h-16 shrink-0 items-center justify-between gap-3 border-b bg-white px-4 py-3 sm:px-6">
            <div className="flex min-w-0 flex-wrap items-center gap-2 text-sm font-medium text-slate-600 sm:gap-3">
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

          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto bg-[#f7f9fc] px-4 pb-0 pt-4 sm:px-6 sm:pb-0 sm:pt-6">
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}
