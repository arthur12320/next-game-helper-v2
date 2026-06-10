## 1. Unified Skills Page

- [x] 1.1 Update `src/app/skills/page.tsx` to fetch both `getAllSkills()` and `fetchDGMoSList()` in parallel
- [x] 1.2 Wrap the page content in a Radix `<Tabs>` layout with "Special Circumstances" and "Delta Green" tabs
- [x] 1.3 Move `<SkillsClient>` into the "Special Circumstances" tab content
- [x] 1.4 Import `DGConfigPanel` and place it in the "Delta Green" tab content, passing `mosList`

## 2. Clean Up DG Characters Page

- [x] 2.1 Remove `fetchDGMoSList()` import and call from `src/app/dg-characters/page.tsx`
- [x] 2.2 Remove the `<Tabs>` wrapper and "DG Config" tab from `src/app/dg-characters/page.tsx`
- [x] 2.3 Render the agent listing directly (no tab chrome) on the DG characters page

## 3. Navbar

- [x] 3.1 Review `src/components/navbar.tsx` nav items and confirm "Skills" points to `/skills`
- [x] 3.2 Rename "Character DG" to "Characters DG" (or keep as-is) per design decision — no route change needed

## 4. Verification

- [x] 4.1 Navigate to `/skills` and confirm both SC and DG tabs render with correct content
- [x] 4.2 Navigate to `/dg-characters` and confirm it shows the agent list with no tab bar
- [x] 4.3 Create, edit, and delete an SC skill from the unified skills page
- [x] 4.4 Create, edit, and delete a DG MoS from the unified skills page
- [x] 4.5 Run `npm run build` and confirm no TypeScript or lint errors
