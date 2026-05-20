export type EntityId = string;
export type IsoDateTime = string;

export const rootPathwayStatuses = ["draft", "active", "physician_approved"] as const;

export type RootPathwayStatus = (typeof rootPathwayStatuses)[number];

export interface RootPathwayStatusConfig {
  value: RootPathwayStatus;
  label: string;
  description: string;
  allowsEditing: boolean;
  allowsPublishing: boolean;
  requiresPhysicianApproval: boolean;
}

export const rootPathwayStatusConfig: Record<RootPathwayStatus, RootPathwayStatusConfig> = {
  draft: {
    value: "draft",
    label: "Draft",
    description: "Editable admin workspace before the pathway is published.",
    allowsEditing: true,
    allowsPublishing: true,
    requiresPhysicianApproval: false,
  },
  active: {
    value: "active",
    label: "Active",
    description: "Published pathway that can guide users and collect analytics.",
    allowsEditing: true,
    allowsPublishing: false,
    requiresPhysicianApproval: false,
  },
  physician_approved: {
    value: "physician_approved",
    label: "Physician Approved",
    description: "Clinically reviewed pathway approved for governed use.",
    allowsEditing: false,
    allowsPublishing: false,
    requiresPhysicianApproval: true,
  },
};

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
export type RecommendationStatus =
  | "draft"
  | "pending_review"
  | "approved"
  | "rejected"
  | "modified"
  | "applied"
  | "archived";

export type RecommendationType =
  | "new_education_block"
  | "duplicate_content_merge"
  | "ingredient_optimization"
  | "funnel_structure"
  | "conversion_fix"
  | "adherence_improvement"
  | "product_priority"
  | "ai_instruction_update"
  | "personalization_rule";

export type RecommendationSource =
  | "ai_pattern_detection"
  | "analytics_threshold"
  | "admin_request"
  | "physician_feedback"
  | "user_behavior"
  | "system_rule";

export type RecommendationImpactArea =
  | "engagement"
  | "conversion"
  | "adherence"
  | "safety"
  | "clinical_governance"
  | "content_quality"
  | "operational_efficiency";

export type RecommendationActionType =
  | "create"
  | "update"
  | "merge"
  | "archive"
  | "reorder"
  | "adjust_weight"
  | "request_review";

export type RecommendationReviewAction = "approve" | "reject" | "modify" | "request_review";

export type SuggestionStatus = RecommendationStatus;
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

export type ApprovalScope =
  | "pathway"
  | "funnel_flow"
  | "education"
  | "products"
  | "ingredients"
  | "optimization_rules"
  | "ai_instructions"
  | "personalization"
  | "follow_up_timeline";

export type ApprovalRequestStatus =
  | "draft"
  | "pending_review"
  | "approved"
  | "rejected"
  | "changes_requested"
  | "cancelled";

export type ApprovalDecision = "approved" | "rejected" | "changes_requested";

export type AuditActorRole =
  | "admin"
  | "physician"
  | "ai_system"
  | "system"
  | "clinical_reviewer";

export type AuditSeverity = "info" | "warning" | "critical";

export interface RootPathwaySummaryMetrics {
  activeUsers: number;
  engagementRate: number;
  conversionRate: number;
  protocolCompletionRate: number;
  educationCompletionRate: number;
  productAttachmentRate: number;
  openAiSuggestions: number;
}

export type AnalyticsTimeRange = "last_7_days" | "last_30_days" | "last_90_days" | "custom";
export type AnalyticsTrendDirection = "up" | "down" | "flat";
export type AnalyticsDataFreshness = "live" | "hourly" | "daily" | "manual";
export type AnalyticsMetricKey = keyof RootPathwaySummaryMetrics;

export interface AnalyticsComparisonWindow {
  label: string;
  startsAt: IsoDateTime;
  endsAt: IsoDateTime;
}

export interface AnalyticsMetricMetadata {
  key: AnalyticsMetricKey;
  label: string;
  description: string;
  unit: "count" | "percent";
  trendDirection: AnalyticsTrendDirection;
  trendValue: number;
  trendLabel: string;
  dataSource: "journey_events" | "commerce_events" | "content_events" | "ai_review_queue";
  freshness: AnalyticsDataFreshness;
  visibleInSummary: boolean;
}

export interface AnalyticsMetadata {
  timeRange: AnalyticsTimeRange;
  timeRangeLabel: string;
  startsAt: IsoDateTime;
  endsAt: IsoDateTime;
  comparison: AnalyticsComparisonWindow;
  generatedAt: IsoDateTime;
  freshness: AnalyticsDataFreshness;
  metricMetadata: AnalyticsMetricMetadata[];
}

export interface PathwayReviewer {
  id: EntityId;
  name: string;
  role: "physician" | "admin" | "clinical_reviewer";
}

export interface AuditActor {
  id: EntityId;
  name: string;
  role: AuditActorRole;
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
  metadata: AnalyticsMetadata;
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
  type: RecommendationType;
  source: RecommendationSource;
  status: RecommendationStatus;
  confidenceScore: number;
  priority: PriorityLevel;
  impactAreas: RecommendationImpactArea[];
  estimatedImpact: {
    label: string;
    value: number;
    unit: "percent" | "count" | "score";
  };
  evidence: {
    metricKey?: AnalyticsMetricKey;
    summary: string;
    observedValue?: number;
    benchmarkValue?: number;
  }[];
  affectedEntities: PathwayRelationshipEndpoint[];
  proposedActions: {
    id: EntityId;
    type: RecommendationActionType;
    label: string;
    description: string;
    target: PathwayRelationshipEndpoint;
    fieldChanges?: ApprovalFieldChange[];
    requiresApproval: boolean;
  }[];
  allowedReviewActions: RecommendationReviewAction[];
  approvalRequestId?: EntityId;
  createdAt: IsoDateTime;
  createdBy: AuditActor;
  reviewedBy?: AuditActor;
  reviewedAt?: IsoDateTime;
  appliedAt?: IsoDateTime;
}

export interface PhysicianReview {
  status: ReviewStatus;
  reviewer?: PathwayReviewer;
  requestedAt?: IsoDateTime;
  reviewedAt?: IsoDateTime;
  comments: string[];
  lockedFields: string[];
}

export interface ApprovalFieldChange {
  fieldPath: string;
  label: string;
  previousValue?: string | number | boolean | null;
  proposedValue?: string | number | boolean | null;
  requiresPhysicianApproval: boolean;
}

export interface ApprovalReviewDecision {
  id: EntityId;
  decision: ApprovalDecision;
  decidedBy: AuditActor;
  decidedAt: IsoDateTime;
  comment?: string;
}

export interface ApprovalRequest {
  id: EntityId;
  title: string;
  scope: ApprovalScope;
  status: ApprovalRequestStatus;
  requestedBy: AuditActor;
  requestedAt: IsoDateTime;
  assignedReviewer?: AuditActor;
  decidedAt?: IsoDateTime;
  summary: string;
  affectedEntityIds: EntityId[];
  fieldChanges: ApprovalFieldChange[];
  decisions: ApprovalReviewDecision[];
}

export interface ActivityLogEntry {
  id: EntityId;
  action: ActivityAction;
  actor: AuditActor;
  createdAt: IsoDateTime;
  summary: string;
  severity: AuditSeverity;
  entityType: "root_pathway" | PathwayRelationshipEntityType | "approval_request";
  entityId: EntityId;
  approvalRequestId?: EntityId;
  fieldChanges?: ApprovalFieldChange[];
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
  approvalRequests: ApprovalRequest[];
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
