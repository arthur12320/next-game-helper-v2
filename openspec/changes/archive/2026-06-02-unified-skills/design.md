## Context

Currently the app has two disconnected places for managing game-system skill configuration:

1. **`/skills` page** — SC skill registry: admins create/edit/delete the named skills that SC characters can train. Managed by `src/app/skills/` and `src/app/actions/sc-skills.ts`.
2. **`/dg-characters` → "DG Config" tab** — DG MoS (Method of Specialization) registry: admins create/edit the professional templates applied to DG agents. Managed by `src/components/dg-character/DGConfigPanel.tsx` and `src/app/actions/dg-config.ts`.

The navbar exposes both as separate top-level links ("Skills" and "Character DG"), making it unclear that both are game-configuration concerns. As game systems grow, this proliferates nav items and configuration surfaces.

## Goals / Non-Goals

**Goals:**
- Consolidate `/skills` and the DG Config tab into one `/skills` page, organized by game system
- Remove the "DG Config" tab from `/dg-characters` (which becomes a pure character listing)
- Restructure the navbar to reflect the new layout (single "Skills" entry)
- Leave a clear extension point so a third game system can be added with minimal structural changes

**Non-Goals:**
- Not changing how SC skills or DG MoS work functionally
- Not adding any new game systems in this change
- Not touching play-mode skill tabs on individual character sheets
- Not changing the database schema or server actions

## Decisions

### 1. Tab-per-system layout inside `/skills`

The unified `/skills` page will use Radix Tabs with one tab per game system (e.g. "Special Circumstances", "Delta Green"). The existing `SkillsClient` and `DGConfigPanel` components slot in as tab content unchanged.

**Why tabs over a single scrolling page**: Each system's skill UI is independently complex (SC has create/edit/delete grid; DG has MoS accordion). Tabs keep them isolated without visual noise.

**Alternative considered**: Accordion sections. Rejected because users typically work on one system at a time, and tabs provide clearer visual separation.

### 2. Keep existing components, change only the container

`DGConfigPanel` and `SkillsClient` are not modified — they are moved into the new tab container. Data fetching (currently in `src/app/dg-characters/page.tsx` via `fetchDGMoSList`) moves to `src/app/skills/page.tsx`.

**Why**: Zero risk of regressions in the existing UIs; purely structural relocation.

### 3. `/dg-characters` becomes a character-list-only page

The "DG Config" tab is removed. The `mosList` fetch is dropped from that page. The tab bar disappears; the character listing renders directly.

**Why**: Removing the tab bar simplifies the DG characters page and eliminates the config surface from a page that is primarily about managing agents.

### 4. Navbar: replace "Skills" + "Character DG" with "Skills" + "Characters DG"

The current "Skills" nav item (`/skills`) is renamed to better indicate it covers all game systems. "Character DG" keeps its href (`/dg-characters`) but is renamed to "Characters DG" to match the pattern. No routes change.

**Alternative**: Merge "Character DG" and "Skills" into a single tabbed route. Rejected — characters and skill configuration are distinct concerns; users navigate between them independently.

## Risks / Trade-offs

- **DG characters page loses its tab UI** → The page simplifies to a flat character list; no content is lost, only the tab chrome is removed. Low risk.
- **`/skills` page takes on two async fetches** → Both `getAllSkills()` and `fetchDGMoSList()` run in parallel on the server; no performance concern.
- **Future game systems need a new tab** → Intentional. Each new system adds one tab entry and one data fetch. The pattern is clear and cheap.

## Migration Plan

1. Update `src/app/skills/page.tsx` — add `fetchDGMoSList()` fetch, render tabbed layout with both `SkillsClient` and `DGConfigPanel`
2. Update `src/app/dg-characters/page.tsx` — remove DG Config tab, remove `mosList` fetch
3. Update `src/components/navbar.tsx` — adjust nav item labels if needed
4. No database migrations, no server action changes, no rollback needed (purely UI restructuring)
