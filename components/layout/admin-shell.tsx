import {
  Bell,
  ChevronDown,
  ChevronRight,
  LogOut,
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
  section: "main" | "wellness" | "engagement" | "intelligence" | "admin";
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
  { id: "admin", label: "Admin" },
] as const;

export function AdminShell({
  navItems,
  children,
  breadcrumbs = ["Root Pathways", "GLP-1 Support"],
}: AdminShellProps) {
  return (
    <main className="min-h-screen bg-[#f7f9fc] text-slate-950">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 flex-col bg-[#071b35] text-slate-200 md:flex">
          <div className="border-b border-white/10 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-500/15 text-blue-200">
                <span className="text-xl font-semibold">A</span>
              </div>
              <div>
                <p className="text-xl font-semibold tracking-[0.22em] text-white">AURYN</p>
                <p className="text-[10px] uppercase tracking-[0.16em] text-slate-400">
                  Wellness Intelligence
                </p>
              </div>
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
                  <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    {section.label}
                  </p>
                  <div className="space-y-1">
                    {sectionItems.map((item) => {
                      const navClassName = `h-10 w-full justify-start gap-3 rounded-md px-3 text-sm font-medium ${
                        item.active
                          ? "bg-violet-600 text-white hover:bg-violet-600 hover:text-white"
                          : "text-slate-300 hover:bg-white/10 hover:text-white"
                      }`;

                      const content = (
                        <>
                          <item.icon className="h-4 w-4" />
                          {item.label}
                        </>
                      );

                      if (item.href) {
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

          <div className="border-t border-white/10 p-3">
            <Button
              variant="ghost"
              className="h-10 w-full justify-start gap-3 text-slate-300 hover:bg-white/10 hover:text-white"
            >
              <Settings className="h-4 w-4" />
              Collapse
            </Button>
          </div>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col">
          <header className="flex min-h-16 items-center justify-between gap-3 border-b bg-white px-4 py-3 sm:px-6">
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

          <div className="border-b bg-white px-4 py-3 md:hidden">
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

          <div className="flex-1 space-y-6 p-4 sm:p-6">{children}</div>
        </section>
      </div>
    </main>
  );
}
