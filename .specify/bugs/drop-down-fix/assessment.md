# Bug Assessment: Invisible BUY/SELL option text in dark mode "Type" dropdown

- **Slug**: drop-down-fix
- **Created**: 2026-09-20
- **Source**: pasted text
- **Verdict**: valid
- **Severity**: medium

## Report (verbatim or summarized)

> In dark mode, in record transaction section, when choosing type, sell and buy are looking invisible, they visible only why cursor is hover over those, make it visually correct.

## Symptom

In the "Record Transaction" form, with the app in dark mode, opening the native `Type` `<select>` dropdown shows the `BUY` and `SELL` options with text that is unreadable against their background — the text only becomes legible when the mouse hovers over an option (the browser's native hover highlight supplies enough contrast to reveal it). Expected: `BUY`/`SELL` option text should be clearly readable at rest, matching the rest of the dark theme.

## Reproduction

1. Toggle the app to dark mode.
2. Navigate to a holding's "Record Transaction" section (`RecordTransactionForm`).
3. Click/open the `Type` select control.
4. Observe the `BUY` and `SELL` options in the opened dropdown list — text is invisible/very low-contrast until the cursor hovers over an option.

## Suspected Code Paths

- `frontend/src/components/RecordTransactionForm.tsx:80-88` — the `<select>` renders `<option value="BUY">BUY</option>` and `<option value="SELL">SELL</option>` with no explicit styling of the `<option>` elements themselves; only the `<select>` gets Tailwind arbitrary-value classes.
- `frontend/src/components/RecordTransactionForm.tsx:59-66` — `typeClasses`/`badgeClasses` compute a `text-[var(--color-success)]`/`text-[var(--color-danger)]` class that is concatenated onto the `<select>`'s className *alongside* an already-present `text-[var(--color-text)]` class on the same element (line 81: `...font-bold text-[var(--color-text)] transition-... ${typeClasses}`). Two different `color`-setting utility classes are applied to the same `<select>`, so which one wins depends on Tailwind's generated stylesheet order rather than intent — this makes the effective text color of the closed control (and by inheritance, of its `<option>`s in some browsers) unreliable.
- `frontend/src/index.css:45-74,80-82` — dark theme sets `--color-text`, `--color-success`, `--color-danger` to light/bright colors and sets `color-scheme: dark` on `:root[data-theme="dark"]`, but there is no rule anywhere in the stylesheet that explicitly styles `option` elements (background or color). Native `<option>` popups are rendered by the OS/browser UA using `color-scheme` plus any color the author sets on `<select>`/`<option>` — when that combination doesn't resolve to a real contrast pair (e.g., a light-on-light or a background the UA substitutes with its own default), the option text is only revealed by the browser's own hover-highlight background, which is exactly the reported symptom.

## Root Cause Hypothesis

The `<select>` for transaction type relies entirely on browser/OS-native rendering for its dropdown list (`<option>` elements are never given explicit `background-color`/`color`), combined with a `<select>` className that stacks two conflicting `text-*` (color) utility classes. In light mode this happens to still look fine because most UAs default `<option>` backgrounds to white and the configured text colors are dark enough to read against white; in dark mode the same options end up with insufficient contrast against the UA's chosen background, and only the browser's native hover/selection highlight (which forces its own background) restores contrast. Confidence: medium-high — this is a well-known class of bug (native `<option>` elements not reliably inheriting author `color`/`background-color` from a styled parent `<select>`), and the code shows both required ingredients (no option-level styling, duplicate/conflicting color classes on the select) with no other CSS in the repo touching `option` elements.

## Proposed Remediation

**Preferred**: Explicitly style the `<option>` elements (not just the `<select>`) with theme-aware `background-color` and `color`, e.g. give each `<option>` a `className`/inline `style` using `var(--color-surface)` for background and the same color used for the `<select>` label (`var(--color-success)` for BUY, `var(--color-danger)` for SELL, or simply `var(--color-text)` for a neutral look) so contrast is guaranteed regardless of UA default. Also remove the redundant/conflicting `text-[var(--color-text)]` utility on the `<select>` in `RecordTransactionForm.tsx:81` so only `typeClasses`' color utility applies to the closed control, eliminating the ambiguous double color declaration.

**Alternatives**:
- Add a global CSS rule in `index.css` (e.g. `select option { background-color: var(--color-surface); color: var(--color-text); }`) — simpler, but loses the current per-option BUY=green/SELL=red color coding unless combined with `:checked`/attribute selectors, which are not well supported for arbitrary styling of `<option>` text color across browsers.
- Replace the native `<select>` with a custom-styled listbox/dropdown component (e.g., a small headless-UI style combobox) — fully solves cross-browser `<option>` styling limitations but is a larger change than the reported bug warrants.

**Files likely to change**:
- `frontend/src/components/RecordTransactionForm.tsx`
- `frontend/src/index.css` (only if the global-rule alternative is chosen instead)

**Tests to add or update**:
- `frontend/tests/App.test.tsx` or a new RTL test for `RecordTransactionForm` asserting the `option` elements for BUY/SELL carry non-default, explicit color/background styling (e.g. via inline style assertions) so a future regression re-introducing UA-default rendering is caught.
- Manual/visual check: open the Type dropdown in both light and dark mode and confirm BUY/SELL are legible at rest (not just on hover) — note automated DOM assertions cannot verify actual rendered contrast of native `<option>` popups, since that rendering is OS-controlled; this should be called out as a manual verification step in `/speckit-bug-test`.

## Risks & Considerations

- Native `<option>` rendering varies significantly across browsers/OSes (Chrome, Firefox, Safari, and their respective platform UAs handle author styles on `<option>` differently), so a fix verified in one browser may not fully generalize; recommend spot-checking in at least Chrome and Firefox.
- If a custom listbox is chosen instead of styling native `<option>`s, that increases scope, bundle size, and requires re-implementing keyboard accessibility that native `<select>` provides for free — not recommended for this bug's severity.

## Open Questions

- [NEEDS CLARIFICATION: which browser(s)/OS the user observed this in — affects how confidently the native-`<option>`-styling fix can be verified without a live visual check.]
