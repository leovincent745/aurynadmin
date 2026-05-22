export type ProductionStatus = "active" | "no_published_instructions" | "needs_setup";

export interface ActivePublishedInstruction {
  id: string;
  versionNumber: number;
  publishedAt: string;
  publishedByEmail: string;
  updatedAt: string;
}

export interface AdminDashboardSummary {
  productionStatus: ProductionStatus;
  activePublished: ActivePublishedInstruction | null;
  hasDraft: boolean;
  totalInstructionCount: number;
}
