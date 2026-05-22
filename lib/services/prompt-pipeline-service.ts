import { AdminInstructionStatus, AiLogEventType, Prisma } from "@prisma/client";

import type { PromptPipelineFilterOptions } from "@/lib/domain/prompt-pipeline-filters";
import type {
  PromptPipelineListItem,
  PromptPipelineListQuery,
  PromptPipelineListResponse,
  PromptPipelineSortDirection,
  PromptPipelineSortField,
  PromptPipelineStatusLabel,
} from "@/lib/domain/prompt-pipelines";
import type { PromptSummaryStatusFilter } from "@/lib/domain/prompt-system-summary";
import { prisma } from "@/lib/db/prisma";

const PIPELINE_NAME = "Auryn Chat Instructions";
const PIPELINE_CATEGORY = "Live Chat";
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

function pipelineCode(versionNumber: number): string {
  return `PROMPT-CHAT-${String(versionNumber).padStart(3, "0")}`;
}

function purposePreview(masterInstructions: string): string {
  const line = masterInstructions.replace(/\s+/g, " ").trim();
  if (!line) return "";
  if (line.length <= 120) return line;
  return `${line.slice(0, 120)}…`;
}

function statusLabel(status: AdminInstructionStatus): PromptPipelineStatusLabel {
  switch (status) {
    case AdminInstructionStatus.published:
      return "Active";
    case AdminInstructionStatus.draft:
      return "In Review";
    case AdminInstructionStatus.archived:
      return "Archived";
    default:
      return "Archived";
  }
}

function statusToDb(filter: PromptSummaryStatusFilter): AdminInstructionStatus | undefined {
  if (filter === "active") return AdminInstructionStatus.published;
  if (filter === "in_review") return AdminInstructionStatus.draft;
  if (filter === "archived") return AdminInstructionStatus.archived;
  return undefined;
}

function formatSuccessRate(success: number, total: number): number | null {
  if (total === 0) return null;
  return Math.round((success / total) * 1000) / 10;
}

function formatModelLabel(): string {
  const raw = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
  if (raw.startsWith("gpt-4o")) return "GPT-4o";
  if (raw.startsWith("gpt-4")) return "GPT-4.1";
  if (raw.startsWith("gpt-5")) return "GPT-5";
  return raw;
}

async function loadRunStatsByInstructionId(): Promise<
  Map<string, { total: number; success: number }>
> {
  const groups = await prisma.aiLog.groupBy({
    by: ["instructionVersionId", "eventType"],
    where: { instructionVersionId: { not: null } },
    _count: { _all: true },
  });

  const map = new Map<string, { total: number; success: number }>();
  for (const row of groups) {
    const id = row.instructionVersionId!;
    const entry = map.get(id) ?? { total: 0, success: 0 };
    const count = row._count._all;
    entry.total += count;
    if (row.eventType === AiLogEventType.chat_success) {
      entry.success += count;
    }
    map.set(id, entry);
  }
  return map;
}

/** All Step 1 rows share this pipeline name — used for name search matching. */
export function pipelineNameMatchesQuery(q: string): boolean {
  const lower = q.toLowerCase();
  return (
    PIPELINE_NAME.toLowerCase().includes(lower) ||
    lower.includes("auryn") ||
    lower.includes("chat instruction")
  );
}

function categoryMatchesQuery(q: string): boolean {
  return PIPELINE_CATEGORY.toLowerCase().includes(q.toLowerCase());
}

function modelMatchesQuery(q: string, modelLabel: string): boolean {
  const lower = q.toLowerCase();
  return (
    modelLabel.toLowerCase().includes(lower) ||
    lower.includes("gpt") ||
    (process.env.OPENAI_MODEL ?? "").toLowerCase().includes(lower)
  );
}

function buildSearchOrConditions(
  search: string,
  modelLabel: string,
): Prisma.AdminInstructionWhereInput[] {
  const q = search.trim();
  const or: Prisma.AdminInstructionWhereInput[] = [];

  or.push({ creator: { email: { contains: q, mode: "insensitive" } } });

  if (/^c[a-z0-9]{20,}$/i.test(q)) {
    or.push({ id: q });
  }

  const codeMatch = q.match(/PROMPT-CHAT-(\d+)/i);
  if (codeMatch) {
    const vn = Number.parseInt(codeMatch[1]!, 10);
    if (!Number.isNaN(vn)) or.push({ versionNumber: vn });
  }

  const versionOnly = q.match(/^v?(\d+)$/i);
  if (versionOnly) {
    const vn = Number.parseInt(versionOnly[1]!, 10);
    if (!Number.isNaN(vn)) or.push({ versionNumber: vn });
  }

  if (pipelineNameMatchesQuery(q)) {
    or.push({ versionNumber: { gte: 1 } });
  }

  if (categoryMatchesQuery(q)) {
    or.push({ versionNumber: { gte: 1 } });
  }

  if (modelMatchesQuery(q, modelLabel)) {
    or.push({ versionNumber: { gte: 1 } });
  }

  if (q.length >= 4) {
    or.push({
      masterInstructions: { contains: q, mode: "insensitive" },
    });
  }

  return or;
}

function buildWhere(
  query: PromptPipelineListQuery,
  modelLabel: string,
): Prisma.AdminInstructionWhereInput {
  const conditions: Prisma.AdminInstructionWhereInput[] = [];

  const dbStatus = query.status ? statusToDb(query.status) : undefined;
  if (dbStatus) {
    conditions.push({ status: dbStatus });
  }

  if (query.category && query.category !== "all") {
    if (query.category !== PIPELINE_CATEGORY) {
      conditions.push({ id: { in: [] } });
    }
  }

  if (query.owner?.trim()) {
    conditions.push({
      creator: { email: { equals: query.owner.trim(), mode: "insensitive" } },
    });
  }

  if (query.model?.trim()) {
    if (query.model.trim() !== modelLabel) {
      conditions.push({ id: { in: [] } });
    }
  }

  const search = query.search?.trim();
  if (search) {
    const or = buildSearchOrConditions(search, modelLabel);
    if (or.length > 0) {
      conditions.push({ OR: or });
    }
  }

  if (conditions.length === 0) return {};
  if (conditions.length === 1) return conditions[0]!;
  return { AND: conditions };
}

export async function getPromptPipelineFilterOptions(): Promise<PromptPipelineFilterOptions> {
  const modelLabel = formatModelLabel();

  const ownerRows = await prisma.adminInstruction.findMany({
    distinct: ["createdBy"],
    select: { creator: { select: { email: true } } },
    orderBy: { creator: { email: "asc" } },
  });

  const owners = ownerRows.map((r) => r.creator.email);

  return {
    pipelineName: PIPELINE_NAME,
    statuses: [
      { value: "all", label: "All Status" },
      { value: "active", label: "Active" },
      { value: "in_review", label: "In Review" },
      { value: "archived", label: "Archived" },
    ],
    categories: [
      { value: "all", label: "All Category" },
      { value: PIPELINE_CATEGORY, label: PIPELINE_CATEGORY },
    ],
    owners: [
      { value: "all", label: "All Owners" },
      ...owners.map((email) => ({ value: email, label: email })),
    ],
    models: [
      { value: "all", label: "All Models" },
      { value: modelLabel, label: modelLabel },
    ],
  };
}

function buildOrderBy(
  sort: PromptPipelineSortField,
  direction: PromptPipelineSortDirection,
): Prisma.AdminInstructionOrderByWithRelationInput[] {
  const dir = direction === "asc" ? "asc" : "desc";
  switch (sort) {
    case "status":
      return [{ status: dir }, { versionNumber: "desc" }];
    case "updated":
      return [{ updatedAt: dir }, { versionNumber: "desc" }];
    case "version":
    default:
      return [{ versionNumber: dir }, { updatedAt: "desc" }];
  }
}

export async function listPromptPipelines(
  query: PromptPipelineListQuery = {},
): Promise<PromptPipelineListResponse> {
  const page = Math.max(1, query.page ?? 1);
  const limit = Math.min(Math.max(1, query.limit ?? DEFAULT_LIMIT), MAX_LIMIT);
  const skip = (page - 1) * limit;
  const sort: PromptPipelineSortField = query.sort ?? "version";
  const sortDirection: PromptPipelineSortDirection = query.sortDirection ?? "desc";
  const modelLabel = formatModelLabel();
  const where = buildWhere(query, modelLabel);
  const filterOptions = await getPromptPipelineFilterOptions();

  const [rows, total, runStats] = await Promise.all([
    prisma.adminInstruction.findMany({
      where,
      orderBy: buildOrderBy(sort, sortDirection),
      skip,
      take: limit,
      select: {
        id: true,
        versionNumber: true,
        masterInstructions: true,
        status: true,
        updatedAt: true,
        creator: { select: { email: true } },
      },
    }),
    prisma.adminInstruction.count({ where }),
    loadRunStatsByInstructionId(),
  ]);

  const items: PromptPipelineListItem[] = rows.map((row) => {
    const stats = runStats.get(row.id);
    const runs = stats?.total ?? 0;
    const success = stats?.success ?? 0;

    return {
      id: row.id,
      name: PIPELINE_NAME,
      code: pipelineCode(row.versionNumber),
      purpose: purposePreview(row.masterInstructions) || "—",
      category: PIPELINE_CATEGORY,
      model: modelLabel,
      status: statusLabel(row.status),
      successRate: formatSuccessRate(success, runs),
      runs,
      updatedAt: row.updatedAt.toISOString(),
      versionNumber: row.versionNumber,
      ownerEmail: row.creator.email,
    };
  });

  return {
    items,
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
    meta: {
      categories: filterOptions.categories
        .filter((c) => c.value !== "all")
        .map((c) => c.value),
      sort,
      sortDirection,
      filterOptions,
    },
  };
}
