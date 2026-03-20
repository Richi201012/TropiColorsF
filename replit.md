# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Project: TropicColors

TropicColors is a Mexican e-commerce platform for artificial food colorants.

### Brand
- Primary Blue: `#003F91`
- Turquoise: `#00A8B5`
- Yellow: `#FFCD00`
- Magenta: `#FF2E63`
- WhatsApp number: +52 55 5114 6856
- Admin password: `tropicolors2024`

### Features
- Full Spanish storefront with product catalog (8 colorant SKUs)
- Cart system with size selection (25g, 100g, 500g, 1kg, 5kg)
- Stripe checkout integration (requires STRIPE_SECRET_KEY env var)
- Contact/quote form saved to DB
- Admin dashboard at `/admin` with sales stats and order management
- Invoice management
- Floating WhatsApp button (always visible)
- Real Tropicolors brand imagery in hero and navbar

### Environment Variables Required
- `STRIPE_SECRET_KEY` — Stripe secret key (sk_test_... or sk_live_...)
- `STRIPE_WEBHOOK_SECRET` — optional, for webhook handler
- `BASE_URL` — the app's public URL (for Stripe success/cancel redirects)
- `DATABASE_URL` — auto-set by Replit PostgreSQL

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   └── tropicolors/        # TropicColors React storefront (at /)
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts
├── pnpm-workspace.yaml     # pnpm workspace
├── tsconfig.base.json      # Shared TS options
├── tsconfig.json           # Root TS project references
└── package.json            # Root package
```

## Database Schema

- `orders` — customer orders with Stripe session IDs, items JSON, status
- `contact_messages` — contact/quote form submissions
- `invoices` — invoice records

## API Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/healthz` | Health check |
| GET | `/api/products` | Product catalog |
| POST | `/api/contact` | Submit contact form |
| POST | `/api/checkout` | Create Stripe checkout session |
| GET | `/api/orders` | List orders (admin) |
| GET | `/api/orders/:id` | Get single order |
| PATCH | `/api/orders/:id/status` | Update order status |
| GET | `/api/invoices` | List invoices |
| POST | `/api/invoices` | Create invoice |
| GET | `/api/admin/stats` | Admin dashboard stats |

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API client from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes
