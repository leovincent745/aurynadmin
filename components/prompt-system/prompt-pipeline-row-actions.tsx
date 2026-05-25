"use client";

import { useEffect, useRef, useState } from "react";
import {
  Eye,
  FlaskConical,
  History,
  MoreHorizontal,
  Pencil,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import type { PromptPipelineListItem } from "@/lib/domain/prompt-pipelines";
import type { PromptPipelineRowAction } from "@/lib/prompt-system/row-actions";

export type { PromptPipelineRowAction };

export interface PromptPipelineRowActionsProps {
  prompt: PromptPipelineListItem;
  onAction: (action: PromptPipelineRowAction, prompt: PromptPipelineListItem) => void;
}

const menuItems: {
  action: PromptPipelineRowAction;
  label: string;
  icon: typeof Pencil;
}[] = [
  { action: "edit", label: "Edit Prompt", icon: Pencil },
  { action: "view-full", label: "View Full Prompt", icon: Eye },
  { action: "run-test", label: "Run Test", icon: FlaskConical },
  { action: "view-history", label: "View History", icon: History },
];

export function PromptPipelineRowActions({ prompt, onAction }: PromptPipelineRowActionsProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  return (
    <div ref={rootRef} className="relative inline-block text-left">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        aria-label={`Actions for ${prompt.code}`}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={(event) => {
          event.stopPropagation();
          setOpen((value) => !value);
        }}
      >
        <MoreHorizontal className="h-4 w-4 text-slate-500" />
      </Button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-20 mt-1 w-44 rounded-md border border-slate-200 bg-white py-1 shadow-lg"
        >
          {menuItems.map((item) => (
            <button
              key={item.action}
              type="button"
              role="menuitem"
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50"
              onClick={(event) => {
                event.stopPropagation();
                setOpen(false);
                onAction(item.action, prompt);
              }}
            >
              <item.icon className="h-3.5 w-3.5 shrink-0 text-violet-600" aria-hidden />
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
