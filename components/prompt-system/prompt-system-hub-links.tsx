import Link from "next/link";
import { ClipboardList, FlaskConical, MessageSquare, ScrollText } from "lucide-react";

const hubLinks = [
  {
    label: "Test Chat",
    description: "Try draft or published instructions",
    href: "/test-chat",
    icon: FlaskConical,
  },
  {
    label: "Version History",
    description: "Every instruction version",
    href: "/admin/instructions/history",
    icon: ScrollText,
  },
  {
    label: "AI Logs",
    description: "Chat outcomes and safety events",
    href: "/ai-optimization-center",
    icon: ClipboardList,
  },
  {
    label: "Conversations",
    description: "Review live user chats",
    href: "/conversations",
    icon: MessageSquare,
  },
] as const;

export function PromptSystemHubLinks() {
  return (
    <nav
      aria-label="Connected Step 1 admin tools"
      className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4"
    >
      {hubLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="group flex min-w-0 items-start gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm transition-colors hover:border-violet-200 hover:bg-violet-50/40"
        >
          <link.icon className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" aria-hidden />
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-slate-950 group-hover:text-violet-700">
              {link.label}
            </span>
            <span className="mt-0.5 block text-xs text-slate-500">{link.description}</span>
          </span>
        </Link>
      ))}
    </nav>
  );
}
