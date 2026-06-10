## Why

The app currently splits skill management across two separate navigation destinations: the `/skills` page (SC skill registry) and the "DG Config" tab on `/dg-characters` (DG MoS configuration). This split creates unnecessary cognitive overhead and makes it hard to reason about skills holistically — especially as new game systems are added.

## What Changes

- Merge the SC skill registry (`/skills`) and the DG MoS config (currently nested under `/dg-characters` → "DG Config" tab) into a single `/skills` page
- The unified `/skills` page will organize skill content by game system with tabs or sections (e.g. "Special Circumstances" and "Delta Green")
- Remove the "DG Config" tab from `/dg-characters`, which then becomes a pure character listing page
- Remove the "Skills" nav item and keep "Character DG" nav, OR rename/restructure nav to reflect the new layout
- Design the unified skills page with a game-system-agnostic structure so future systems (e.g. Call of Cthulhu, Shadowrun) can be added without restructuring

## Capabilities

### New Capabilities

- `unified-skills-page`: A single `/skills` page that displays skill management for all game systems, organized by system tabs or sections, replacing the split between `/skills` and the DG Config tab

### Modified Capabilities

- `sc-skills-admin`: The existing SC skill registry moves into the unified page under a "Special Circumstances" section — no functional changes, just relocated
- `dg-mos-config`: DG MoS configuration moves from the "DG Config" tab on `/dg-characters` into the unified page under a "Delta Green" section — no functional changes, just relocated

## Impact

- `src/app/skills/page.tsx` and `src/app/skills/skills-client.tsx` — rewritten to host both SC skills and DG MoS config
- `src/app/dg-characters/page.tsx` — remove the DG Config tab and `mosList` data fetching
- `src/components/navbar.tsx` — update nav items to reflect the consolidated structure
- `src/components/dg-character/DGConfigPanel.tsx` — relocated into the skills page, no functional changes
