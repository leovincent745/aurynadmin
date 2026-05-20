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

---

## Clone and Run Project

Follow these steps to clone and run the project locally.

### 1. Clone Repository

```bash
git clone <repository-url>
```

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