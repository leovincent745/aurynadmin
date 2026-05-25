"use client";

import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Database,
  FileJson,
  FlaskConical,
  MessageSquare,
  Pencil,
  ShieldCheck,
  Upload,
  UserCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type FlowLink = {
  label: string;
  href: string;
};

type FlowStep = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  step1Label: string;
  links?: FlowLink[];
  staticOnly?: boolean;
};

function buildSteps(selectedPipelineId: string | null): FlowStep[] {
  const editHref = selectedPipelineId
    ? `/prompt-system?selected=${selectedPipelineId}&tab=prompt&panel=edit`
    : null;
  const outputsHref = selectedPipelineId
    ? `/prompt-system?selected=${selectedPipelineId}&tab=outputs`
    : null;

  return [
    {
      id: "data-sources",
      title: "Data Sources",
      description:
        "Products, research, pathways, and user context feed future pipelines. Step 1 does not automate ingestion.",
      icon: Database,
      step1Label: "Reference only",
      staticOnly: true,
    },
    {
      id: "prompt-instructions",
      title: "Prompt Instructions",
      description:
        "Admins define master instructions, guardrails, and protocol rules in the working draft.",
      icon: Pencil,
      step1Label: "Instruction Editor",
      links: editHref ? [{ label: "Open editor", href: editHref }] : undefined,
    },
    {
      id: "structured-output",
      title: "Structured Output",
      description:
        "Chat responses follow the published instruction contract (conversation id, reply, version metadata).",
      icon: FileJson,
      step1Label: "Outputs tab",
      links: outputsHref ? [{ label: "View schema", href: outputsHref }] : undefined,
    },
    {
      id: "safety-validation",
      title: "Safety Validation",
      description:
        "Run safety shortcuts in Admin Test Chat and confirm escalations/refusals in AI Logs before go-live.",
      icon: ShieldCheck,
      step1Label: "Test & logs",
      links: [
        { label: "Test Chat", href: "/test-chat" },
        { label: "Safety Logs", href: "/ai-optimization-center" },
      ],
    },
    {
      id: "admin-review",
      title: "Admin Review",
      description:
        "Review real user conversations and flag threads for follow-up. No automated physician governance in Step 1.",
      icon: UserCheck,
      step1Label: "Conversations",
      links: [{ label: "Conversation Review", href: "/conversations" }],
    },
    {
      id: "publish",
      title: "Publish",
      description:
        "Publish Live promotes the validated draft to production chat. Prior live versions are archived automatically.",
      icon: Upload,
      step1Label: "Publish Live",
      links: editHref
        ? [{ label: "Publish from editor", href: editHref }]
        : [{ label: "Prompt System", href: "/prompt-system" }],
    },
  ];
}

function FlowStepCard({
  step,
  showArrow,
}: {
  step: FlowStep;
  showArrow: boolean;
}) {
  const Icon = step.icon;

  return (
    <div className="flex min-w-0 flex-1 items-stretch gap-2">
      <div className="flex min-w-0 flex-1 flex-col rounded-lg border border-slate-200 bg-gradient-to-b from-white to-slate-50/80 p-4 shadow-sm">
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-violet-100 text-violet-700">
            <Icon className="h-5 w-5" aria-hidden />
          </div>
          <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-700">
            {step.step1Label}
          </span>
        </div>
        <p className="text-sm font-semibold leading-snug text-slate-950">{step.title}</p>
        <p className="mt-2 flex-1 text-xs leading-relaxed text-slate-600">{step.description}</p>
        {step.staticOnly ? (
          <p className="mt-3 text-[10px] font-medium text-slate-400">No automation in Step 1</p>
        ) : null}
        {step.links && step.links.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {step.links.map((link) => (
              <Button key={link.href} asChild size="sm" variant="outline" className="h-7 text-xs">
                <Link href={link.href}>{link.label}</Link>
              </Button>
            ))}
          </div>
        ) : !step.staticOnly ? (
          <p className="mt-3 text-[10px] text-slate-400">Select a pipeline row to open tools</p>
        ) : null}
      </div>
      {showArrow ? (
        <div
          className="hidden shrink-0 items-center text-slate-300 lg:flex"
          aria-hidden
        >
          <ArrowRight className="h-5 w-5" />
        </div>
      ) : null}
    </div>
  );
}

export interface PipelineExecutionFlowProps {
  selectedPipelineId?: string | null;
}

export function PipelineExecutionFlow({ selectedPipelineId = null }: PipelineExecutionFlowProps) {
  const steps = buildSteps(selectedPipelineId);

  return (
    <Card className="col-span-full border-violet-100 bg-white shadow-sm">
      <CardHeader className="border-b border-slate-100 p-4 pb-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base text-slate-950">Pipeline Execution Flow</CardTitle>
            <p className="mt-1 max-w-3xl text-xs text-slate-600">
              How Step 1 admin work connects from instruction authoring to live Auryn chat. Visual
              guide only — future orchestration (pathways, journeys, physician governance) is not
              automated here.
            </p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-800">
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
            Step 1 workflow
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch">
          {steps.map((step, index) => (
            <FlowStepCard key={step.id} step={step} showArrow={index < steps.length - 1} />
          ))}
        </div>
        <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-600">
          <span className="inline-flex items-center gap-1">
            <FlaskConical className="h-3.5 w-3.5 text-violet-600" aria-hidden />
            Test Chat validates drafts before publish
          </span>
          <span className="inline-flex items-center gap-1">
            <MessageSquare className="h-3.5 w-3.5 text-violet-600" aria-hidden />
            Conversation Review inspects live quality after publish
          </span>
        </p>
      </CardContent>
    </Card>
  );
}

/** @deprecated Use PipelineExecutionFlow — kept for import compatibility */
export function ExecutionFlow(props: PipelineExecutionFlowProps) {
  return <PipelineExecutionFlow {...props} />;
}
