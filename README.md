# Auryn Admin Frontend

Frontend setup for the Auryn Admin user web app.

## Stack

- Next.js 15
- React
- TypeScript
- TailwindCSS
- ShadCN-style component setup

## Product Direction

This app is the Root Pathway Module Admin Portal for Auryn. It should stay modular, reusable, editable, visual, scalable, and friendly for non-technical admins.

See [REQUIREMENTS.md](./REQUIREMENTS.md) for the working product requirements.

The Root Pathway entity schema is defined in [docs/root-pathway-schema.md](./docs/root-pathway-schema.md) and implemented in `lib/domain/root-pathway.ts`.

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## ShadCN

The project includes `components.json`, `lib/utils.ts`, and starter UI components under `components/ui`.
After dependencies are installed, you can add more components with:

```bash
npx shadcn@latest add input dropdown-menu table
```
