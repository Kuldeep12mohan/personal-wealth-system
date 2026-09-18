# Quickstart: Validate the Tailwind CSS UI Modernization

## Prerequisites

- `frontend/` dependencies installed, including the new `tailwindcss` and
  `@tailwindcss/vite` dev dependencies added by this feature.
- A running backend (or the existing mocked-fetch test setup) per
  `specs/001-wealth-management-poc/quickstart.md` — this feature makes no backend changes.

## Automated validation (primary)

From `frontend/`:

```powershell
npm test
```

Expected: the full existing suite (all `frontend/tests/*.test.tsx` files, unmodified)
passes with the same assertions as before this feature (spec FR-003, FR-005, SC-001) —
no test file needed to change, since none assert on CSS class names.

```powershell
npm run build
```

Expected: the production build succeeds with Tailwind's CSS processed via the
`@tailwindcss/vite` plugin, and no build errors from the removed/replaced `index.css`
rules.

## Manual validation (end-to-end)

1. Start the backend and frontend per the existing project quickstart
   (`specs/001-wealth-management-poc/quickstart.md`).
2. Open the Portfolio Setup screen. **Expected**: Create Portfolio, Add Investment, and
   Record Transaction sections are present, usable, and visually consistent (spacing,
   typography, color) — no unstyled or visually broken elements (spec SC-002).
3. Open the Portfolio Dashboard for a portfolio with holdings. **Expected**: Summary panel,
   holdings table (including each holding's allocation percentage next to its Current
   Value, from `specs/002-holding-allocation-percentage/`), and the Add
   Investment/Record Transaction/Update Price panels all render and function exactly as
   before, with modernized styling.
4. Toggle light/dark mode (if a theme toggle control is present in the UI, or by clearing
   `localStorage`'s `pw-theme` key and reloading with a system dark-mode preference).
   **Expected**: both themes render correctly with no unstyled or mis-colored elements —
   the existing `data-theme` + CSS-variable theme system continues to work unchanged.
5. Resize the browser to a narrow/mobile width while viewing the holdings table. **Expected**:
   the table's existing responsive/collapsing behavior still works (spec FR-008).
6. Inspect `frontend/package.json` and `frontend/src/index.css`. **Expected**: `tailwindcss`
   and `@tailwindcss/vite` are the only new entries; `index.css` contains the Tailwind
   import plus the retained `:root` / `:root[data-theme="dark"]` token blocks only, with no
   leftover component-specific plain CSS rules (spec FR-006, FR-007).

## Traceability

- Spec: `specs/003-tailwind-ui-modernization/spec.md` (FR-001–FR-008, SC-001–SC-004)
- Plan: `specs/003-tailwind-ui-modernization/plan.md`
- Constitution: `.specify/memory/constitution.md` v1.2.0 (Tailwind CSS approved as the
  frontend styling exception)
- No API contracts changed — see `specs/001-wealth-management-poc/contracts/` for the
  unchanged existing endpoints this feature's UI reads from and writes to.
