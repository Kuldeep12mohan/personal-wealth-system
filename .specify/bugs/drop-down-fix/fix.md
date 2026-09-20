# Bug Fix: Invisible BUY/SELL option text in dark mode "Type" dropdown

- **Slug**: drop-down-fix
- **Fixed**: 2026-09-20
- **Assessment**: ./assessment.md
- **Status**: applied

## Summary

Explicitly styled the `BUY`/`SELL` `<option>` elements in `RecordTransactionForm`'s Type dropdown with theme-aware background/text colors, and removed a redundant/conflicting `text-*` color class from the parent `<select>`, so the options no longer rely on ambiguous native rendering that made them unreadable in dark mode until hovered.

## Changes

| File | Change | Notes |
|------|--------|-------|
| `frontend/src/components/RecordTransactionForm.tsx` | modified | Removed `text-[var(--color-text)]` from the `<select>` className (leaving only `typeClasses`' color rule). Added explicit `style={{ backgroundColor: "var(--color-surface)", color: ... }}` to each `<option>` — green (`var(--color-success)`) for BUY, red (`var(--color-danger)`) for SELL — so option text is guaranteed contrast against an explicit background rather than the browser's UA default. |
| `frontend/tests/RecordTransactionForm.test.tsx` | added test | New test asserts both options carry non-empty, distinct inline `color`/`backgroundColor` styles, pinning the fix so a regression to unstyled `<option>`s is caught. |

## Diff Highlights

```tsx
<select
  className={`min-w-[140px] rounded-lg border-2 px-4 py-[9px] font-sans text-[15px] font-bold transition-[border-color,box-shadow] duration-150 focus:shadow-[0_0_0_3px_var(--color-primary-soft)] focus:outline-none ${typeClasses}`}
  value={type}
  onChange={(e) => setType(e.target.value as TransactionType)}
  aria-label="Transaction type"
>
  <option value="BUY" style={{ backgroundColor: "var(--color-surface)", color: "var(--color-success)" }}>
    BUY
  </option>
  <option value="SELL" style={{ backgroundColor: "var(--color-surface)", color: "var(--color-danger)" }}>
    SELL
  </option>
</select>
```

## Tests Added or Updated

- `frontend/tests/RecordTransactionForm.test.tsx::BUY and SELL options have explicit background/text colors so they stay legible in dark mode` — asserts each `<option>` has a non-empty inline `backgroundColor`/`color` and that BUY and SELL use distinct colors.

## Local Verification

- Commands run: `npx vitest run tests/RecordTransactionForm.test.tsx` → 3/3 passed.
- Commands run: `npx vitest run` (full frontend suite) → 8 files, 28/28 tests passed, no regressions.
- Manual checks: not performed in this session (no browser available here). Per the assessment's Open Question, a manual visual check in Chrome and Firefox with dark mode enabled is recommended to confirm the native `<option>` popup now renders with visible text at rest (not just on hover) — this is called out as the required manual step for `/speckit-bug-test`.

## Deviations from Assessment

None. Applied the assessment's "Preferred" remediation as written (explicit per-option styling + removing the duplicate color class), rather than the global-CSS-rule or custom-listbox alternatives.

## Follow-ups

- Manually verify the dropdown in at least Chrome and Firefox (dark mode) since native `<option>` rendering is OS/browser-controlled and not fully verifiable via jsdom/RTL assertions alone.
- Consider a shared inline-style helper if more BUY/SELL-styled dropdowns are added elsewhere, to avoid duplicating the `backgroundColor`/`color` pairs.
