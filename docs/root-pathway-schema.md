# Root Pathway Entity Schema

The Root Pathway entity is the central editable object for the Auryn admin portal. It owns the pathway's business identity, funnel orchestration, content, products, personalization, governance, analytics, and audit trail.

## Entity Groups

### Identity

- `id`
- `name`
- `slug`
- `status`: Draft, Active, or Physician Approved
- `priority`
- `aiVisibility`
- `description`
- `targetWellnessState`
- `commonSymptoms`
- `businessPriorityScore`
- `physicianOwner`
- `lastUpdatedAt`
- `relatedPathways`

### Status Model

Pathway status is defined by `rootPathwayStatuses` and `rootPathwayStatusConfig`.

- Draft: editable admin workspace before publishing
- Active: published pathway that can guide users and collect analytics
- Physician Approved: clinically reviewed pathway approved for governed use

Each status includes:

- label
- description
- whether admins can edit
- whether admins can publish
- whether physician approval is required

### Funnel Flow

- `funnelNodes`
- node type: start, question, quick action, outcome, follow-up
- node position for visual builder layout
- options and next-node routing
- weighting changes
- linked education, products, AI instructions, and follow-up triggers

### Education

- `educationBlocks`
- title and description
- priority
- AI tags
- linked funnel stages
- linked symptoms
- engagement score
- global reusability flag
- lifecycle status

### Quick Actions

- `quickActions`
- user-facing action labels
- pathway weighting changes
- linked education, products, and AI instructions

### Products

- `productContributions`
- product role
- contribution weight
- required, optional, or conditional status
- ingredient summary
- linked symptoms
- conditions
- removal flexibility
- sort order

### Ingredients

- `ingredientRules`
- dosage totals
- soft and hard thresholds
- interactions
- linked products and pathways
- warnings
- optimization preferences

### Optimization Rules

- `optimizationRules`
- IF condition
- THEN action
- priority
- enabled state
- physician approval requirement

### AI Instructions

- `aiInstructions`
- category: tone, prohibited claim, escalation, education emphasis, physician messaging
- instruction text
- visibility
- physician approval state

### Personalization

- `personalizationRules`
- profile filters for sex, age, body weight, surgery type, medication profile, activity level, and sensitivities
- pathway behavior changes
- enabled state

### Follow-Up Timeline

- `followUpTimeline`
- day offset
- trigger type
- linked education and funnel nodes
- enabled state

### Analytics

- `analytics`
- metadata:
  - time range
  - start and end timestamps
  - comparison window
  - generated timestamp
  - freshness
  - per-metric metadata
- active users
- engagement rate
- conversion rate
- protocol completion rate
- education completion rate
- product attachment rate
- open AI suggestions
- top quick actions, pathway combinations, products, and low-engagement funnel nodes

Each analytics metric can define:

- key
- label
- description
- unit
- trend direction
- trend value
- trend label
- data source
- freshness
- whether it appears in the summary KPI row

### Self Learning

- `selfLearningSuggestions`
- recommendation type
- recommendation source
- status:
  - draft
  - pending review
  - approved
  - rejected
  - modified
  - applied
  - archived
- confidence score
- priority
- impact areas
- estimated impact
- evidence
- affected entities
- proposed actions
- allowed review actions
- optional approval request link
- creation, review, and application metadata

Self-learning recommendations are admin-moderated. The AI can propose changes, but admins decide whether to approve, reject, modify, or send them into a physician review workflow.

Recommendation examples:

- create a new education block
- merge duplicate content
- optimize ingredient thresholds
- improve funnel structure
- fix low-conversion steps
- improve adherence
- adjust product priority
- update AI instructions
- add personalization rules

### Physician Governance

- `physicianReview`
- review status
- reviewer
- review timestamps
- comments
- locked fields

### Approval Architecture

- `approvalRequests`
- approval scope:
  - pathway
  - funnel flow
  - education
  - products
  - ingredients
  - optimization rules
  - AI instructions
  - personalization
  - follow-up timeline
- approval status:
  - draft
  - pending review
  - approved
  - rejected
  - changes requested
  - cancelled
- requested by actor
- assigned reviewer
- affected entity IDs
- field-level proposed changes
- reviewer decisions

Approval requests are used when admin or AI-driven changes need physician or clinical governance before becoming final.

### Audit History

- `activityLogs`
- action
- actor with role
- timestamp
- summary
- severity
- entity type and ID
- optional approval request link
- optional field-level changes
- optional metadata

Audit logs are append-only records for transparency, rollback support, compliance, and debugging. Every meaningful admin edit, AI suggestion, approval request, approval decision, publish event, and rollback should create an audit log entry.

### Relationship Graph

- `relationships`
- explicit source and target endpoints
- supported endpoint types:
  - product
  - ingredient
  - education block
  - funnel node
  - AI instruction
  - personalization rule
  - quick action
  - follow-up
  - optimization rule
- relationship types:
  - recommends
  - contains
  - educates
  - triggers
  - modifies
  - personalizes
  - constrains
  - requires review
  - warns about
  - supports
- strength score for visual weighting
- admin editability flag
- physician review requirement flag

## Relationship Examples

- Funnel node -> education block: a user answer shows a relevant education card.
- Funnel node -> product: a decision path changes product recommendation weight.
- Product -> ingredient: a product contributes to ingredient dosage totals.
- Ingredient -> optimization rule: threshold overlap triggers an IF/THEN rule.
- Optimization rule -> product: automatic logic changes product contribution.
- Personalization rule -> AI instruction: user profile changes AI behavior.
- AI instruction -> education block: AI tone controls how education is framed.

## Source Files

- TypeScript schema: `lib/domain/root-pathway.ts`
- Seed data: `lib/data/root-pathways.ts`
