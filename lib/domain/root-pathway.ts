export type EntityId = string;
export type IsoDateTime = string;

export type RootPathwayStatus =
  | "draft"
  | "active"
  | "physician_approved"
  | "needs_revision"
  | "locked"
  | "archived";

export type ReviewStatus =
  | "not_submitted"
  | "pending_review"
  | "approved"
  | "needs_revision"
  | "locked";

export type PriorityLevel = "low" | "medium" | "high" | "critical";
export type VisibilityStatus = "hidden" | "admin_only" | "ai_visible" | "user_visible";
export type ContributionRole = "primary" | "secondary" | "supporting";
export type RequirementStatus = "required" | "optional" | "conditional";
export type SuggestionStatus = "pending_review" | "approved" | "rejected" | "modified";
export type PathwayRelationshipEntityType =
  | "product"
  | "ingredient"
  | "education_block"
  | "funnel_node"
  | "ai_instruction"
  | "personalization_rule"
  | "quick_action"
  | "follow_up"
  | "optimization_rule";

export type PathwayRelationshipType =
  | "recommends"
  | "contains"
  | "educates"
  | "triggers"
  | "modifies"
  | "personalizes"
  | "constrains"
  | "requires_review"
  | "warns_about"
  | "supports";

export type ActivityAction =
  | "created"
  | "updated"
  | "published"
  | "review_requested"
  | "approved"
  | "rejected"
  | "ai_suggestion_created"
  | "rule_changed"
  | "rollback";

export interface RootPathwaySummaryMetrics {
  activeUsers: number;
  engagementRate: number;
  conversionRate: number;
  protocolCompletionRate: number;
  educationCompletionRate: number;
  productAttachmentRate: number;
  openAiSuggestions: number;
}

export interface PathwayReviewer {
  id: EntityId;
  name: string;
  role: "physician" | "admin" | "clinical_reviewer";
}

export interface PathwayRelation {
  id: EntityId;
  name: string;
  relationship: "related" | "supports" | "conflicts_with" | "often_combined";
}

export interface PathwayRelationshipEndpoint {
  entityType: PathwayRelationshipEntityType;
  entityId: EntityId;
  label: string;
}

export interface PathwayRelationship {
  id: EntityId;
  source: PathwayRelationshipEndpoint;
  target: PathwayRelationshipEndpoint;
  type: PathwayRelationshipType;
  label: string;
  description?: string;
  strength: number;
  editableByAdmin: boolean;
  requiresPhysicianReview: boolean;
}

export interface FunnelOption {
  id: EntityId;
  label: string;
  nextNodeId?: EntityId;
  outcomeId?: EntityId;
  weightingChanges: PathwayWeightingChange[];
}

export interface FunnelNode {
  id: EntityId;
  type: "start" | "question" | "quick_action" | "outcome" | "follow_up";
  title: string;
  prompt: string;
  position: {
    x: number;
    y: number;
  };
  options: FunnelOption[];
  linkedEducationBlockIds: EntityId[];
  linkedProductIds: EntityId[];
  linkedAiInstructionIds: EntityId[];
  followUpTriggerIds: EntityId[];
}

export interface PathwayWeightingChange {
  pathwayId: EntityId;
  delta: number;
  reason: string;
}

export interface EducationBlock {
  id: EntityId;
  title: string;
  description: string;
  priority: PriorityLevel;
  aiTags: string[];
  linkedFunnelNodeIds: EntityId[];
  linkedSymptoms: string[];
  engagementScore: number;
  reusableGlobally: boolean;
  status: "draft" | "active" | "retired";
}

export interface QuickAction {
  id: EntityId;
  label: string;
  description: string;
  weightingChanges: PathwayWeightingChange[];
  linkedEducationBlockIds: EntityId[];
  linkedProductIds: EntityId[];
  linkedAiInstructionIds: EntityId[];
}

export interface ProductContribution {
  id: EntityId;
  productId: EntityId;
  productName: string;
  imageUrl?: string;
  role: ContributionRole;
  contributionWeight: number;
  requirement: RequirementStatus;
  ingredientSummary: string;
  linkedSymptoms: string[];
  conditions: string[];
  removalFlexibility: "low" | "medium" | "high";
  sortOrder: number;
}

export interface IngredientRule {
  id: EntityId;
  ingredientName: string;
  currentTotalDosage: string;
  softThreshold: string;
  hardThreshold: string;
  interactions: string[];
  linkedProductIds: EntityId[];
  linkedPathwayIds: EntityId[];
  warning?: string;
  optimizationPreference?: string;
}

export interface OptimizationRule {
  id: EntityId;
  name: string;
  ifCondition: string;
  thenAction: string;
  priority: PriorityLevel;
  enabled: boolean;
  requiresPhysicianApproval: boolean;
}

export interface AiInstruction {
  id: EntityId;
  category:
    | "tone"
    | "prohibited_claim"
    | "escalation"
    | "education_emphasis"
    | "physician_messaging";
  instruction: string;
  visibility: VisibilityStatus;
  approvedByPhysician: boolean;
}

export interface PersonalizationRule {
  id: EntityId;
  name: string;
  filters: {
    sex?: string[];
    ageRange?: {
      min?: number;
      max?: number;
    };
    bodyWeightRange?: {
      min?: number;
      max?: number;
    };
    surgeryTypes?: string[];
    medicationProfiles?: string[];
    activityLevels?: string[];
    sensitivities?: string[];
  };
  pathwayBehaviorChange: string;
  enabled: boolean;
}

export interface FollowUpTimelineItem {
  id: EntityId;
  dayOffset: number;
  title: string;
  triggerType: "check_in" | "education" | "symptom_assessment" | "recovery_review";
  linkedEducationBlockIds: EntityId[];
  linkedFunnelNodeIds: EntityId[];
  enabled: boolean;
}

export interface AnalyticsSnapshot {
  metrics: RootPathwaySummaryMetrics;
  topQuickActionIds: EntityId[];
  topPathwayCombinationIds: EntityId[];
  highestConvertingProductIds: EntityId[];
  lowEngagementFunnelNodeIds: EntityId[];
  symptomImprovementNotes: string[];
}

export interface SelfLearningSuggestion {
  id: EntityId;
  title: string;
  description: string;
  type:
    | "new_education_block"
    | "duplicate_content_merge"
    | "ingredient_optimization"
    | "funnel_structure"
    | "conversion_fix"
    | "adherence_improvement";
  status: SuggestionStatus;
  createdAt: IsoDateTime;
  reviewedBy?: EntityId;
  reviewedAt?: IsoDateTime;
}

export interface PhysicianReview {
  status: ReviewStatus;
  reviewer?: PathwayReviewer;
  requestedAt?: IsoDateTime;
  reviewedAt?: IsoDateTime;
  comments: string[];
  lockedFields: string[];
}

export interface ActivityLogEntry {
  id: EntityId;
  action: ActivityAction;
  actorId: EntityId;
  actorName: string;
  createdAt: IsoDateTime;
  summary: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface RootPathway {
  id: EntityId;
  name: string;
  slug: string;
  status: RootPathwayStatus;
  priority: PriorityLevel;
  aiVisibility: VisibilityStatus;
  description: string;
  targetWellnessState: string;
  commonSymptoms: string[];
  businessPriorityScore: number;
  physicianOwner?: PathwayReviewer;
  lastUpdatedAt: IsoDateTime;
  relatedPathways: PathwayRelation[];
  funnelNodes: FunnelNode[];
  educationBlocks: EducationBlock[];
  quickActions: QuickAction[];
  productContributions: ProductContribution[];
  ingredientRules: IngredientRule[];
  optimizationRules: OptimizationRule[];
  aiInstructions: AiInstruction[];
  personalizationRules: PersonalizationRule[];
  followUpTimeline: FollowUpTimelineItem[];
  analytics: AnalyticsSnapshot;
  selfLearningSuggestions: SelfLearningSuggestion[];
  physicianReview: PhysicianReview;
  activityLogs: ActivityLogEntry[];
  relationships: PathwayRelationship[];
}

export const rootPathwayTabs = [
  "overview",
  "funnel-flow",
  "education",
  "quick-actions",
  "products",
  "ingredients",
  "optimization-rules",
  "ai-instructions",
  "personalization",
  "follow-up-timeline",
  "analytics",
  "self-learning",
  "physician-review",
  "activity-logs",
] as const;

export type RootPathwayTab = (typeof rootPathwayTabs)[number];
