# Root Pathway Entity Schema

The Root Pathway entity is the central editable object for the Auryn admin portal. It owns the pathway's business identity, funnel orchestration, content, products, personalization, governance, analytics, and audit trail.

## Entity Groups

### Identity

- `id`
- `name`
- `slug`
- `status`
- `priority`
- `aiVisibility`
- `description`
- `targetWellnessState`
- `commonSymptoms`
- `businessPriorityScore`
- `physicianOwner`
- `lastUpdatedAt`
- `relatedPathways`

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
- active users
- engagement rate
- conversion rate
- protocol completion rate
- education completion rate
- product attachment rate
- open AI suggestions
- top quick actions, pathway combinations, products, and low-engagement funnel nodes

### Self Learning

- `selfLearningSuggestions`
- suggestion type
- pending, approved, rejected, or modified status
- review metadata

### Physician Governance

- `physicianReview`
- review status
- reviewer
- review timestamps
- comments
- locked fields

### Audit History

- `activityLogs`
- action
- actor
- timestamp
- summary
- optional metadata

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
