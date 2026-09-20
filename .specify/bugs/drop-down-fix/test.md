# Bug Verification: Invisible BUY/SELL option text in dark mode "Type" dropdown

- **Slug**: drop-down-fix
- **Tested**: 2026-09-20
- **Assessment**: ./assessment.md
- **Fix**: ./fix.md
- **Result**: partial

## Summary

The code-level root cause (no explicit `background-color`/`color` on the `<option>` elements, plus a conflicting `text-*` class on the `<select>`) is fixed and verified via source inspection and a new regression test; the full frontend test suite and a type-check both pass with no regressions. However, the original symptom is a rendered-pixel issue in a native OS/browser dropdown popup, and no browser automation tool was available in this session to visually re-open the Type dropdown in dark mode and confirm text is legible at rest — so the fix is not end-to-end reproduction-verified.

## Checks Performed

| Check | Command / Action | Result | Notes |
|-------|------------------|--------|-------|
| Reproduction (post-fix) | Manual: toggle dark mode, open Type dropdown, inspect BUY/SELL legibility at rest | not-run | No connected browser automation tool this session (`ide` MCP server failed to connect; no `claude-in-chrome` session active) and no headless/e2e (Playwright/Cypress) tooling configured in the repo. Verified via source read instead: `frontend/src/components/RecordTransactionForm.tsx:86-96` now sets explicit inline `backgroundColor: var(--color-surface)` and a distinct `color` (`var(--color-success)` / `var(--color-danger)`) on each `<option>`, removing the previous reliance on unstyled native rendering. |
| New / updated tests | `npx vitest run tests/RecordTransactionForm.test.tsx` | pass | 3/3 tests pass, including the new test asserting both options carry distinct, non-empty inline colors. |
| Regression suite | `npx vitest run` (full frontend suite) | pass | 8 files / 28 tests, all passing, no regressions in other components. |
| Lint / type-check | `npx tsc --noEmit` | pass | No type errors. |

## Output Excerpts

```
tests/RecordTransactionForm.test.tsx (3 tests) 78ms
Test Files  1 passed (1)
     Tests  3 passed (3)
```

```
Test Files  8 passed (8)
     Tests  28 passed (28)
```

`tsc --noEmit` produced no output (clean pass).

## Residual Risks

- Native `<option>` popup rendering is controlled by the OS/browser UA and can vary (Chrome vs. Firefox vs. Safari, and their platform renderers). The inline `style` on `<option>` is the standard, widely-supported way to influence this, but it has not been visually confirmed in an actual browser in this session.
- Automated tools (jsdom/RTL) cannot render the native dropdown popup pixel-for-pixel, so the added test can only assert that the intended styles are present on the DOM nodes — it cannot prove the popup is visually legible.

## Recommendation

Hold for a quick manual visual check before closing: open the app in a browser, switch to dark mode, and open the "Type" dropdown in Record Transaction to confirm BUY/SELL are readable at rest (not only on hover). All automatable evidence (source fix matching the assessed root cause, new regression test, full suite, and type-check) is green, so this is very likely resolved, but per the guardrail against marking a fix `verified` without exercising the original reproduction, this is recorded as `partial` until that manual check is done.
