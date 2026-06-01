# Cocina de Mama

Bilingual (Spanish/English) PWA for managing a small catering business with two modes:
- **Daily Sales:** Mom picks 2-3 dishes, announces via Facebook/WhatsApp, collects pre-orders + walk-up sales at a factory. 50+ orders/day.
- **Event Catering:** Rare/seasonal custom catering with quotes and deposits.

## Tech Stack
- Next.js 16 (App Router) + TypeScript
- Tailwind CSS 4 + shadcn/ui
- Supabase (PostgreSQL + Auth + Realtime)
- next-intl for i18n (Spanish primary, English secondary)
- TanStack Query v5 for server state
- Serwist for PWA/service worker
- Vercel free tier hosting

## Key Conventions
- All pages live under `src/app/[locale]/` for i18n routing
- Translation files: `src/messages/es.json` (primary), `src/messages/en.json`
- DB columns use bilingual pairs: `name_es`/`name_en`
- Server actions in `src/lib/actions/` — no API routes
- Supabase clients: `src/lib/supabase/client.ts` (browser), `server.ts` (SSR)
- Utility: `cn()` in `src/lib/utils/cn.ts` for className merging
- Constants/types in `src/lib/utils/constants.ts`

## Commands
- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run lint` — ESLint

## GSD Development
This project uses get-shit-done phases for development management.
Project state: `.planning/`

## UI Rules
- Touch targets: minimum 48px (56px for primary actions)
- Base font: 18px mobile, stats 24-32px
- Theme: warm orange (#EA580C) primary, cream (#FFF7ED) light / navy (#0F172A) dark
- Must work at 4 AM in dark mode on an iPhone
