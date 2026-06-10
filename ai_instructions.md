# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server with Turbopack
npm run build      # Production build
npm run lint       # ESLint
npm run db:migrate # Run Drizzle ORM migrations
```

## Stack

- **Framework**: Next.js 15 (App Router, Server Components, Server Actions)
- **Language**: TypeScript (strict mode, `@/*` alias → `src/*`)
- **Styling**: Tailwind CSS 4 + Radix UI primitives (`src/components/ui/`)
- **Database**: Drizzle ORM + Vercel Postgres
- **Auth**: NextAuth v5 beta — Google OAuth with email allowlist (`allowedUsers` table)
- **Storage**: Vercel Blob for images/assets
- **Real-time**: Server-Sent Events for session presence (`/api/sessions/events`)

## Architecture

This is an RPG campaign management app. The domain is built around the **Special Circumstances** tabletop RPG system.

### Data flow pattern
- **Reads**: Server Components fetch directly via Drizzle in page/layout files
- **Mutations**: `src/app/actions/` — "use server" server actions that call `revalidatePath()` after writes
- **Client state**: React Context (`CharacterContext`) only for multi-step character creation form

### Key directories
- `src/app/actions/` — all Server Actions (16 files, one per domain entity)
- `src/db/schema/` — 21 Drizzle table definitions; `index.ts` re-exports all
- `src/components/ui/` — Radix-based primitives, do not modify unless extending primitives
- `src/components/character*/` and `src/components/sc-character/` — character creation multi-step flow
- `src/middleware.ts` — route protection; `publicRoutes` and `authRoutes` arrays control access

### Auth & access control
Routes are protected by `src/middleware.ts`. New routes need to be added to `publicRoutes` or they are protected by default. Email allowlist is enforced in `src/auth.ts` via the `signIn` callback.

### Database
Schema lives in `src/db/schema/index.ts` (aggregates all table files). After any schema change, run `npm run db:migrate`. Drizzle config uses `DATABASE_URL` env var.

### Domain model highlights
- **Campaigns**: owned by a creator, players join via invite; roles: creator/DM/player
- **Sessions**: belong to campaigns, have presence tracking (SSE), status, and adventure journal
- **SC Characters**: complex multi-step form — abilities (Will, Health, Resources, Circles, Mindchip), skills, lifepaths, connections, homeworld/upbringing
- **Conditions**: game mechanics tracking (Hungry, Tired, Sick, Injured, etc.); see `conditions.md` for recovery rules
- **Maps**: OTFBM integration for battle maps
- **Assets**: file uploads via `/api/upload` → Vercel Blob

### Image uploads
Upload endpoint is `src/app/api/upload/route.ts`. Server Actions body limit is 20 MB (set in `next.config.ts`). Next.js image optimization is disabled (`unoptimized: true`) — Vercel Blob handles CDN.
