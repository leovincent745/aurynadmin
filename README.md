# Auryn Admin Frontend

Frontend setup for the Auryn Admin user web app.

---

## Stack

- Next.js 15
- React
- TypeScript
- TailwindCSS
- ShadCN-style component setup

---

## Product Direction

This app is the **Root Pathway Module Admin Portal** for Auryn.

The platform should remain:

- Modular
- Reusable
- Editable
- Visual
- Scalable
- Friendly for non-technical admins

See:

- [REQUIREMENTS.md](./REQUIREMENTS.md) — Product requirements
- [docs/root-pathway-schema.md](./docs/root-pathway-schema.md) — Root Pathway schema
- `lib/domain/root-pathway.ts` — Schema implementation
- [docs/component-architecture.md](./docs/component-architecture.md) — Component architecture
- [docs/requirements/step-1-implementation-spec.md](./docs/requirements/step-1-implementation-spec.md) — **Primary** Step 1 implementation spec (AI/developer handoff)
- [docs/requirements/README.md](./docs/requirements/README.md) — Requirements index and reading order
- [docs/internal/chat-database-schema.md](./docs/internal/chat-database-schema.md) — Chat, instructions, and AI logs (PostgreSQL / Prisma)

---

## Clone and Run Project

Follow these steps to clone and run the project locally.

### 1. Clone Repository

```bash
git clone <repository-url>
```

### Database & admin auth

1. Copy `.env.example` to `.env` and set `DATABASE_URL` and `SESSION_SECRET` (32+ chars).
2. Run `npm run db:migrate` then `npm run db:seed`.
3. Sign in at `/login` with seeded credentials (`ADMIN_EMAIL` / `ADMIN_PASSWORD`, default `auryn@gmail.com` / `1234567890`).

Schema: `prisma/schema.prisma` — see [docs/internal/feature-1-admin-auth.md](./docs/internal/feature-1-admin-auth.md)

### 2. Navigate to Project Directory

```bash
cd auryn-admin-frontend
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start Development Server

```bash
npm run dev
```

### 5. Open in Browser

Visit:

```txt
http://localhost:3000
```

---

## Available Scripts

### Run Development Server

```bash
npm run dev
```

### Build Production Version

```bash
npm run build
```

### Start Production Server

```bash
npm run start
```

### Run Lint Checks

```bash
npm run lint
```

---

## Project Structure

```txt
auryn-admin-frontend/
│
├── app/                    # Next.js app router pages
├── components/             # Shared reusable components
│   └── ui/                 # Base UI components
├── docs/                   # Documentation files
├── lib/                    # Domain models, utilities, shared logic
├── public/                 # Static assets
├── styles/                 # Global styles
├── REQUIREMENTS.md         # Product requirements
└── README.md
```

---

## ShadCN Setup

The project includes:

- `components.json`
- `lib/utils.ts`
- Starter UI components under `components/ui`

You can generate additional components after installation.

Example:

```bash
npx shadcn@latest add input dropdown-menu table
```

Add more components as needed:

```bash
npx shadcn@latest add dialog sheet select textarea tabs
```

---

## Development Notes

Recommended workflow:

1. Pull latest changes.
2. Create a feature branch.
3. Build reusable components.
4. Follow component architecture guidelines.
5. Keep UI modular and editable.
6. Test responsive layouts before pushing.

---

## Requirements Reference

Primary documentation:

- `REQUIREMENTS.md`
- `docs/root-pathway-schema.md`
- `docs/component-architecture.md`

Please review these documents before starting development.

---

## Environment Setup

If environment variables are required, create:

```bash
.env.local
```

Add project-specific variables.

Example:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

---

## Tech Guidelines

Use:

- TypeScript strict typing
- Reusable component patterns
- Tailwind utility styling
- Responsive layouts
- Consistent design system patterns

Avoid:

- Hardcoded UI logic
- Large monolithic components
- Repeated styling patterns
- Business logic inside UI components

---

## License

Internal Auryn project.