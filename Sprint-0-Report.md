# Sprint 0 Report — Project Bootstrap & Development Environment

**Date:** 2026-07-25
**Status:** COMPLETE

---

## Sprint 0 Tasks

| ID | Task | Status | Notes |
|----|------|--------|-------|
| S0.1 | Initialize Next.js 16 project | ✅ Done | Next.js 16.2.11 project scaffolded |
| S0.2 | Install all production dependencies | ✅ Done | React 19, Tailwind 4, shadcn/ui, TanStack Query, Axios, RHF, Zod, lucide-react |
| S0.3 | Install all dev dependencies | ✅ Done | ESLint 9, TypeScript 5, PostCSS, Playwright, Vitest, MSW |
| S0.4 | Configure TypeScript | ✅ Done | `@/*` → `./src/*`, strict mode, `jsx: react-jsx` |
| S0.5 | Configure Tailwind CSS v4 | ✅ Done | `@tailwindcss/postcss` plugin, CSS-first configuration via `@theme` |
| S0.6 | Integrate Stitch design tokens | ✅ Done | All Stitch color tokens in `globals.css` `@theme inline` block |
| S0.7 | Configure ESLint | ✅ Done | `eslint.config.mjs` with `next/core-web-vitals` + `next/typescript` |
| S0.8 | Create full folder structure | ✅ Done | Created missing `features/admin/` (api, hooks, components) + `public/images/` |
| S0.9 | Create `.env.local` and config | ✅ Done | `NEXT_PUBLIC_API_URL` configured |
| S0.10 | Initialize shadcn/ui | ✅ Done | `components.json`, `src/lib/utils.ts`, `button.tsx` installed |

## Fixes Applied

1. **Port conflict** — Updated `package.json` dev script to `next dev -p 3000` to avoid conflicting with backend (port 3001) and the `PORT=3001` env var from root `.env`
2. **Next.js generated type bug** — Removed `.next/dev/types/**/*.ts` from `tsconfig.json` `include` (kept `.next/types/**/*.ts`). The bug was that `next build` with a stale `.next` cache generated a malformed `validator.ts` (missing `import` keyword). Removing the dev types include from tsconfig prevents `tsc --noEmit` from being affected by any future stale generated files. `next build` re-adds it automatically and its own type checking passes correctly.
3. **Missing directory** — Created `src/features/admin/api/`, `src/features/admin/hooks/`, `src/features/admin/components/` to match architecture doc
4. **Missing directory** — Created `public/images/` to match architecture doc

## Verification

| Check | Result |
|-------|--------|
| `npm run lint` (frontend) | ✅ Passes |
| `npx tsc --noEmit` (frontend) | ✅ Passes |
| `npm run build` (frontend) | ✅ Succeeds (2 static pages) |
| `npm run dev` (frontend) | ✅ Serves HTTP 200 at localhost:3000 |
| `npm run typecheck` (backend) | ✅ Passes |
| `npm run build` (backend) | ✅ Succeeds |
| `npm run dev` (backend) | ✅ Serves at localhost:3001, DB connected |

## Environment Notes

- Backend connects to PostgreSQL on `localhost:5432`, database `clinic_booking`
- Frontend API URL: `http://localhost:8000/api/v1` (configured in `.env.local`)
- Build requires `NODE_ENV` to not be `development` (setting in root `.env` conflicts with Next.js)
- Frontend uses Turbopack by default (configured in `next.config.ts`)
