# Component Architecture

This project uses a simple reusable React structure:

```text
app/
  page.tsx

components/
  layout/
    admin-shell.tsx
  pathways/
    root-pathway-overview.tsx
    pathway-page-header.tsx
    pathway-record-summary.tsx
    pathway-metrics.tsx
    schema-coverage-card.tsx
    relationship-graph-preview.tsx
    pathway-nav.ts
  ui/
    button.tsx
    card.tsx
    input.tsx
    table.tsx

lib/
  data/
    root-pathways.ts
  domain/
    root-pathway.ts
```

## How To Think About It

### `app/page.tsx`

This is the route entry point. Keep it small.

Its job:

- choose data
- choose layout
- compose feature components

Example:

```tsx
<AdminShell navItems={pathwayNavItems}>
  <RootPathwayOverview pathway={glpOneSupportPathway} />
</AdminShell>
```

### `components/layout`

Layout components create the page frame.

`AdminShell` owns:

- sidebar
- top search bar
- notification button
- main content spacing

It should not know pathway business logic.

### `components/pathways`

Pathway components understand Root Pathway data.

Examples:

- `PathwayPageHeader`
- `PathwayRecordSummary`
- `PathwayMetrics`
- `SchemaCoverageCard`
- `RelationshipGraphPreview`

These components receive a `pathway` prop and render one focused section.

`PathwayPageHeader` owns the page title, status badges, primary actions, reviewer, ID, and last-updated metadata.

`PathwayRecordSummary` owns record-level admin fields like priority score, AI visibility, active users, analytics snapshot, related pathways, and related products.

### `components/ui`

These are small design-system building blocks from ShadCN style.

Examples:

- `Button`
- `Card`
- `Input`
- `Table`

They should stay generic. Do not put pathway business logic here.

### `lib/domain`

Domain files define TypeScript types.

Use this when asking, "What shape does the data have?"

### `lib/data`

Data files hold temporary mock or seed data.

Later, this can be replaced by API calls without rewriting most UI components.

## Beginner React Concepts

### Component

A component is a function that returns UI.

```tsx
function Example() {
  return <p>Hello</p>;
}
```

### Props

Props are inputs passed into a component.

```tsx
function PathwayPageHeader({ pathway }: PathwayPageHeaderProps) {
  return <h1>{pathway.name}</h1>;
}
```

When used:

```tsx
<PathwayPageHeader pathway={glpOneSupportPathway} />
```

### Composition

Composition means building a large screen from small pieces.

```tsx
<RootPathwayOverview pathway={pathway} />
```

Inside that component:

```tsx
<PathwayPageHeader pathway={pathway} />
<PathwayMetrics pathway={pathway} />
<RelationshipGraphPreview pathway={pathway} />
```

This is better than placing everything in one huge file.

## Rules For Future Components

- Every feature should support the product principle: modular, reusable, editable, visual, scalable, and non-technical user friendly.
- One component should have one clear job.
- Keep route files small.
- Put business-specific components in `components/pathways`.
- Put generic UI pieces in `components/ui`.
- Define data shapes in `lib/domain`.
- Pass data down using props.
- Avoid copying the same card or section logic in multiple places.

## Product Capability Checklist

When adding a new screen or component, check whether it helps admins do one of these jobs:

- Create and manage pathways
- Configure funnel logic
- Define decision trees
- Manage education content
- Assign products and ingredients
- Configure optimization rules
- Edit AI instructions
- Set personalization rules
- Review analytics
- Approve AI suggestions
- Handle physician review workflows
- Access activity logs and audit history

## Feature Pattern Examples

- Drag/drop funnel builder: admin config tool
- Education cards CRUD: admin content management
- Optimization IF/THEN rules: admin logic builder
- AI instruction editor: admin behavior controls
- Physician review statuses: governance workflow
- Self-learning approvals: admin moderation system

## How To Add The Next Section

For example, to add a Funnel Flow section:

1. Create `components/pathways/funnel-flow-preview.tsx`.
2. Accept `pathway: RootPathway` as a prop.
3. Render `pathway.funnelNodes`.
4. Import it into `root-pathway-overview.tsx`.
5. Add `<FunnelFlowPreview pathway={pathway} />`.
