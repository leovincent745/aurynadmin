import {
  BarChart3,
  Bot,
  GitBranch,
  Package,
  Signal,
  Star,
  Users,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import type { RootPathway, VisibilityStatus } from "@/lib/domain/root-pathway";

interface PathwayRecordSummaryProps {
  pathway: RootPathway;
}

const visibilityLabels: Record<VisibilityStatus, string> = {
  hidden: "Hidden",
  admin_only: "Admin Only",
  ai_visible: "AI Visible",
  user_visible: "User Visible",
};

export function PathwayRecordSummary({ pathway }: PathwayRecordSummaryProps) {
  const activeUsers = pathway.analytics.metrics.activeUsers.toLocaleString();
  const engagement = Math.round(pathway.analytics.metrics.engagementRate * 100);
  const conversion = Math.round(pathway.analytics.metrics.conversionRate * 1000) / 10;
  const relatedProducts = pathway.productContributions.slice(0, 3);

  return (
    <Card className="bg-white">
      <CardContent className="p-0">
        <div className="grid divide-y text-sm lg:grid-cols-4 lg:divide-x lg:divide-y-0">
          <SummaryTile
            icon={Star}
            label="Priority Score"
            value={`${pathway.businessPriorityScore}/100`}
            detail={`${capitalize(pathway.priority)} priority`}
            tone="amber"
          />
          <SummaryTile
            icon={Bot}
            label="AI Visibility"
            value={visibilityLabels[pathway.aiVisibility]}
            detail="Used by AI guidance and recommendations"
            tone="violet"
            action={<VisibilitySwitch enabled={pathway.aiVisibility !== "hidden"} />}
          />
          <SummaryTile
            icon={Users}
            label="Active Users"
            value={activeUsers}
            detail={pathway.analytics.metadata.timeRangeLabel}
            tone="blue"
          />
          <SummaryTile
            icon={BarChart3}
            label="Analytics Snapshot"
            value={`${engagement}% engagement`}
            detail={`${conversion}% conversion`}
            tone="emerald"
          />
        </div>

        <div className="grid gap-4 border-t p-4 lg:grid-cols-2">
          <RelatedSection
            icon={GitBranch}
            title="Related Pathways"
            items={pathway.relatedPathways.map((related) => ({
              id: related.id,
              label: related.name,
              meta: related.relationship.replaceAll("_", " "),
            }))}
          />
          <RelatedSection
            icon={Package}
            title="Related Products"
            items={relatedProducts.map((product) => ({
              id: product.id,
              label: product.productName,
              meta: `${capitalize(product.role)} - ${product.contributionWeight}% weight`,
            }))}
          />
        </div>
      </CardContent>
    </Card>
  );
}

interface SummaryTileProps {
  icon: typeof Signal;
  label: string;
  value: string;
  detail: string;
  tone: "amber" | "blue" | "emerald" | "violet";
  action?: React.ReactNode;
}

function SummaryTile({
  icon: Icon,
  label,
  value,
  detail,
  tone,
  action,
}: SummaryTileProps) {
  return (
    <div className="flex min-h-32 items-start gap-3 p-5">
      <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-full ${toneClasses[tone]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
          {action}
        </div>
        <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
        <p className="mt-1 text-xs text-slate-500">{detail}</p>
      </div>
    </div>
  );
}

interface RelatedSectionProps {
  icon: typeof Signal;
  title: string;
  items: {
    id: string;
    label: string;
    meta: string;
  }[];
}

function RelatedSection({ icon: Icon, title, items }: RelatedSectionProps) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-4 w-4 text-blue-500" />
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item.id}
            className="rounded-md border bg-slate-50 px-3 py-2 text-xs text-slate-700"
            title={item.meta}
          >
            <span className="font-medium">{item.label}</span>
            <span className="ml-2 text-slate-400">{item.meta}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function VisibilitySwitch({ enabled }: { enabled: boolean }) {
  return (
    <span
      className={`flex h-5 w-9 items-center rounded-full p-0.5 ${
        enabled ? "justify-end bg-blue-600" : "justify-start bg-slate-300"
      }`}
      aria-label={enabled ? "AI visibility enabled" : "AI visibility disabled"}
      role="switch"
      aria-checked={enabled}
    >
      <span className="h-4 w-4 rounded-full bg-white shadow-sm" />
    </span>
  );
}

const toneClasses = {
  amber: "bg-amber-50 text-amber-600",
  blue: "bg-blue-50 text-blue-600",
  emerald: "bg-emerald-50 text-emerald-600",
  violet: "bg-violet-50 text-violet-600",
};

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
