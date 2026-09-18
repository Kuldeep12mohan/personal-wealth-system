# Phase 0 Research: Tailwind CSS UI Modernization

No `NEEDS CLARIFICATION` markers remain in the Technical Context. The research below
covers the integration, theming, and rollout decisions needed to implement the spec safely.

## Decision: Tailwind CSS version and Vite integration

**Decision**: Use Tailwind CSS v4 with the official `@tailwindcss/vite` plugin. Add a single
`@import "tailwindcss";` line to `frontend/src/index.css` (no separate `tailwind.config.js`
or PostCSS config file is required for the default setup) and register the plugin in
`frontend/vite.config.ts`'s `plugins` array alongside the existing `@vitejs/plugin-react`.

**Rationale**: Tailwind v4's Vite plugin is the current first-party integration path for
Vite projects, requires the fewest new config files (satisfying constitution Principle I —
smallest solution), and needs no PostCSS setup, keeping the build pipeline close to its
current shape. This directly satisfies spec FR-006 (Tailwind only, no other framework) and
FR-001 (Tailwind utilities as the styling mechanism).

**Alternatives considered**:
- Tailwind v3 with a `tailwind.config.js` + PostCSS pipeline — rejected: requires an
  additional PostCSS config file and content-globbing setup that v4's Vite plugin makes
  unnecessary; more moving parts for the same outcome (constitution Principle I).
- A component library built on Tailwind (e.g., a pre-built UI kit) — rejected: spec FR-006
  and constitution Principle IX explicitly limit the addition to Tailwind CSS itself, not a
  component library on top of it.

## Decision: Preserving the existing light/dark theme system

**Decision**: Keep the existing CSS custom-property design tokens (`--color-*`, defined in
`:root` and overridden in `:root[data-theme="dark"]`) and the existing `useTheme` hook
exactly as-is. For any utility that must change with the theme (backgrounds, text, borders,
shadows, the primary accent), use Tailwind's arbitrary-value syntax to reference the
existing CSS variable directly, e.g. `bg-[var(--color-surface)]`,
`text-[var(--color-text-muted)]`, `border-[var(--color-border)]`. For spacing, sizing,
typography scale, flex/grid layout, and border-radius — none of which vary by theme — use
Tailwind's standard utility scale directly (see mapping below), dropping the corresponding
custom `--space-*`/`--radius-*` tokens once every consumer is migrated.

**Rationale**: The existing token scale already lines up closely with Tailwind's default
spacing/radius scale (Tailwind's unit is `0.25rem` = 4px):

| Existing token | Value | Tailwind equivalent |
|---|---|---|
| `--space-1` | 4px | `1` (`p-1`, `gap-1`, ...) |
| `--space-2` | 8px | `2` |
| `--space-3` | 12px | `3` |
| `--space-4` | 16px | `4` |
| `--space-5` | 24px | `6` |
| `--space-6` | 32px | `8` |
| `--space-7` | 48px | `12` |
| `--radius-sm` | 8px | `rounded-lg` |
| `--radius-md` | 12px | `rounded-xl` |
| `--radius-lg` | 16px | `rounded-2xl` |

Reusing Tailwind's own scale for these avoids re-declaring a parallel token set in Tailwind
config (simpler, per Principle I), while keeping the *color* tokens as CSS variables is what
preserves the existing runtime theme toggle without needing Tailwind's own `dark:` variant
or any changes to `useTheme.ts` — the `data-theme` attribute keeps doing exactly what it does
today. This satisfies spec FR-002/FR-003 (no behavior change) most directly of any option.

**Alternatives considered**:
- Registering the color tokens in a Tailwind `@theme` block and using generated utilities
  (e.g. `bg-surface`) plus Tailwind's `dark:` variant — rejected: would require configuring
  a custom dark-mode selector strategy (`@custom-variant dark`) to match the existing
  `[data-theme="dark"]` attribute instead of Tailwind's default `class`/`media` strategies,
  adding configuration complexity for no behavioral benefit over the simpler arbitrary-value
  approach.
- Dropping the CSS-variable theme system and using Tailwind's `dark:` variant with
  `prefers-color-scheme` only — rejected: would remove the existing user-facing manual
  light/dark toggle, a behavior change forbidden by spec FR-002/FR-003.

## Decision: Migration approach and scope

**Decision**: Migrate one file at a time (App shell → pages → each form component →
`HoldingsTable` → `SummaryPanel`), replacing each component's plain CSS class names with
Tailwind utility classes in its JSX, then remove that component's now-unused rules from
`index.css` in the same change. Structural JSX (element types, nesting, conditional
rendering, ARIA attributes, `data-label` attributes, `role`, event handlers) is left
untouched — only `className` values change. After all components are migrated,
`index.css` is reduced to the Tailwind import plus the two retained `:root` design-token
blocks (and nothing else).

**Rationale**: A component-by-component migration keeps each change small and independently
verifiable (constitution Principle VIII — incremental, scoped changes), avoids a single
large-diff rewrite that would be hard to review, and satisfies spec FR-007 (no dead CSS left
behind) by pairing each JSX migration with deletion of the CSS it replaces.

**Alternatives considered**:
- Rewrite all of `index.css` and every component in one pass — rejected: harder to verify
  incrementally, higher risk of missing a behavior/accessibility regression across ~1080
  lines of CSS and 8 files at once.
- Leave `index.css` in place unchanged and only add Tailwind utilities on top — rejected:
  violates spec FR-007 (no now-unused legacy CSS) and FR-006's intent of Tailwind being the
  actual styling mechanism, not a decorative addition alongside the old system.

## Decision: Loading spinner and other small CSS-only effects

**Decision**: Replace the existing hand-written `.spinner` class and its `@keyframes spin`
rule (`frontend/src/index.css`, loading indicator on the dashboard) with Tailwind's built-in
`animate-spin` utility, which produces the same rotating-spinner effect natively.

**Rationale**: Tailwind ships this exact animation as a utility class; keeping a
hand-written duplicate would violate FR-007 (no dead/duplicated CSS) and Principle I
(smallest solution). No visible or behavioral difference results.

**Alternatives considered**:
- Keep the custom `@keyframes spin` rule as an intentional exception — rejected: Tailwind's
  equivalent utility makes the custom rule redundant; keeping it serves no purpose spec
  FR-007 would accept.

## Decision: Test impact

**Decision**: No test files require modification. A review of `frontend/tests/*.test.tsx`
confirms all assertions query by ARIA role, accessible label, visible text, or `data-label`
attribute — never by CSS class name — so changing `className` values has no effect on any
existing assertion (spec FR-005).

**Rationale**: Confirms the migration can proceed without any test-file changes, keeping
this feature's footprint limited to styling files as intended by FR-001/FR-002.

**Alternatives considered**: N/A — this is a verification finding, not a choice between
alternatives.
