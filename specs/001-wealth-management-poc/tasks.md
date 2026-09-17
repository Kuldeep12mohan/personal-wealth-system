---

description: "Task list for Personal Wealth Management System POC"
---

# Tasks: Personal Wealth Management System POC

**Input**: Design documents from `/specs/001-wealth-management-poc/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/openapi.yaml, quickstart.md

**Tests**: Included. Constitution Principle III ("Testability by Design") requires every business
rule and calculation to have a corresponding automated test written in the same change that
introduces the behavior — Pytest for backend, React Testing Library (via Vitest) for frontend.

**Organization**: Tasks are grouped by user story (from spec.md) to enable independent
implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on an incomplete task)
- **[Story]**: Maps the task to US1–US4 from spec.md
- Every task names its exact file path

## Path Conventions (from plan.md)

- Backend: `backend/app/{api,models,schemas,services}/`, `backend/tests/{contract,unit}/`
- Frontend: `frontend/src/{components,pages,services}/`, `frontend/tests/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization per plan.md Project Structure.

- [X] T001 Create the repository skeleton exactly as laid out in plan.md Project Structure: `backend/app/{api,models,schemas,services}/`, `backend/tests/{contract,unit}/`, `frontend/src/{components,pages,services}/`, `frontend/tests/`
- [X] T002 Initialize backend Python project: create `backend/requirements.txt` with `fastapi`, `uvicorn`, `sqlalchemy`, `pydantic`, `pytest`, `httpx` (for FastAPI TestClient)
- [X] T003 [P] Initialize frontend project: create `frontend/package.json` with `react`, `react-dom`, `vite`, `typescript`, `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom` (research.md: Vitest as the Vite-native RTL runner)
- [X] T004 [P] Configure Vite dev server proxy for `/api` → `http://localhost:8000` in `frontend/vite.config.ts` (quickstart.md setup)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure shared by every user story. No story-specific work may start
until this phase is complete.

- [X] T005 Create SQLAlchemy engine/session/declarative Base in `backend/app/db.py`: SQLite file `backend/wealth.db`, schema created via `Base.metadata.create_all(engine)` on startup — no migration tool (research.md)
- [X] T006 [P] Create `Portfolio` SQLAlchemy model in `backend/app/models/portfolio.py` per data-model.md: `portfolioId` (string PK, e.g. `PORT-10001`), `name` (required, non-empty), `currency` (enum `INR`/`USD` only), `createdAt` (auto-set, immutable)
- [X] T007 [P] Create `Holding` SQLAlchemy model in `backend/app/models/holding.py` per data-model.md: `holdingId` (string PK, e.g. `HOLD-20001`), `portfolioId` (FK → Portfolio, required), `name` (required, non-empty), `symbol` (required, non-empty, duplicates within a portfolio allowed), `type` (enum `STOCK`/`MUTUAL_FUND`/`ETF` only), `currentPrice` (defaults to `0` at creation per FR-006a, must be `> 0` when updated), `createdAt` (auto-set, immutable)
- [X] T008 [P] Create `Transaction` SQLAlchemy model in `backend/app/models/transaction.py` per data-model.md: `transactionId` (string PK, e.g. `TXN-30001`), `holdingId` (FK → Holding, required), `type` (enum `BUY`/`SELL` only), `quantity` (decimal, required, must be `> 0`), `price` (decimal, required, must be `> 0`), `transactionDate` (date, required), `createdAt` (auto-set, immutable)
- [X] T009 [P] Create rounding utility in `backend/app/services/rounding.py`: `round_money(value)` → `Decimal` quantized to 2 decimal places with `ROUND_HALF_UP`; `round_quantity(value)` → `Decimal` quantized to 4 decimal places with `ROUND_HALF_UP` (FR-019a)
- [X] T010 [P] Create identifier utility in `backend/app/services/ids.py`: `generate_portfolio_id()`, `generate_holding_id()`, `generate_transaction_id()` producing `PORT-`, `HOLD-`, `TXN-` prefixed sequential ids seeded at 10001, 20001, 30001 respectively (research.md)
- [X] T011 Create FastAPI app entrypoint in `backend/app/main.py`: initializes DB on startup (calls `db.py`), creates empty `portfolios`, `holdings`, `transactions` routers to be filled in by later phases
- [X] T012 [P] Create shared typed API client base in `frontend/src/services/apiClient.ts`: a `fetch` wrapper that parses JSON, and surfaces `{error: string}` bodies (per contracts/openapi.yaml `Error` schema) as thrown errors with that message
- [X] T013 [P] Create `App.tsx` shell in `frontend/src/App.tsx` with a simple in-memory view switch between `PortfolioSetupPage` and `PortfolioDashboardPage` — no router library, no third screen (FR-022–FR-024)
- [X] T014 [P] Add shared plain CSS in `frontend/src/index.css` (no CSS framework, per Constitution Principle IX)

**Checkpoint**: Foundation ready — user story implementation can now begin.

---

## Phase 3: User Story 1 - Set Up a Portfolio and Its Holdings (Priority: P1) 🎯 MVP

**Goal**: A user can create a portfolio and add one or more investment holdings to it, all from
the Portfolio Setup screen (spec.md US1).

**Independent Test**: Create a portfolio, confirm a `portfolioId` is generated and displayed, add
an investment to it, confirm a `holdingId` is generated — without needing transaction or dashboard
functionality.

### Tests for User Story 1

> Write these tests FIRST; ensure they FAIL before implementation.

- [X] T015 [P] [US1] Contract test for `POST /api/portfolios` in `backend/tests/contract/test_create_portfolio.py`: valid `{name, currency}` → 201 with a `portfolioId` matching `PORT-\d+`; missing `name` or `currency` → 400; `currency` outside `{INR, USD}` → 400 (FR-001, FR-002, FR-003)
- [X] T016 [P] [US1] Contract test for `POST /api/portfolios/{portfolioId}/holdings` in `backend/tests/contract/test_add_holding.py`: valid request → 201 with `holdingId` matching `HOLD-\d+` and `currentPrice == 0`; missing `name`/`symbol` or unsupported `type` → 400; unknown `portfolioId` → 404; adding a second holding with a symbol already used in the same portfolio → 201 (separate holding, not merged/rejected) (FR-004–FR-007, FR-006a)
- [X] T017 [P] [US1] Unit test for portfolio creation rules in `backend/tests/unit/test_portfolio_service.py` covering FR-001–FR-003 (blank name, blank currency, unsupported currency all rejected; no partial record persisted)
- [X] T018 [P] [US1] Unit test for holding creation rules in `backend/tests/unit/test_holding_service.py` covering FR-004–FR-007 and FR-006a (blank name/symbol, unsupported type, unknown portfolio all rejected; new holding starts at `currentPrice = 0`; duplicate symbol creates a second holding)

### Implementation for User Story 1

- [X] T019 [US1] Implement `PortfolioService.create_portfolio` in `backend/app/services/portfolio_service.py`: reject blank `name`; reject `currency` not in `{INR, USD}` (FR-001, FR-003); generate id via `ids.generate_portfolio_id()`; persist via `db.py` session
- [X] T020 [US1] Implement `HoldingService.add_holding` in `backend/app/services/holding_service.py`: reject blank `name`/`symbol`; reject `type` not in `{STOCK, MUTUAL_FUND, ETF}` (FR-005); 404 if `portfolioId` does not exist (FR-007); allow duplicate `symbol` within the same portfolio as an independent new holding (FR-007); initialize `currentPrice = 0` (FR-006a); generate id via `ids.generate_holding_id()`
- [X] T021 [US1] Create Pydantic schemas in `backend/app/schemas/portfolio.py` (`CreatePortfolioRequest`, `Portfolio`) and `backend/app/schemas/holding.py` (`AddHoldingRequest`, `Holding`) exactly matching contracts/openapi.yaml
- [X] T022 [US1] Implement `POST /api/portfolios` in `backend/app/api/portfolios.py` calling `PortfolioService.create_portfolio`; register router in `backend/app/main.py`
- [X] T023 [US1] Implement `POST /api/portfolios/{portfolioId}/holdings` in `backend/app/api/holdings.py` calling `HoldingService.add_holding`; register router in `backend/app/main.py`
- [X] T024 [P] [US1] Create `PortfolioSetupPage` shell and `CreatePortfolioForm` component in `frontend/src/pages/PortfolioSetupPage.tsx` and `frontend/src/components/CreatePortfolioForm.tsx`: calls `POST /api/portfolios`, displays the generated `portfolioId` (FR-002), shows validation errors inline (FR-003)
- [X] T025 [P] [US1] Create `AddInvestmentForm` component in `frontend/src/components/AddInvestmentForm.tsx`, mounted on `PortfolioSetupPage`: calls `POST /api/portfolios/{portfolioId}/holdings`, `type` select restricted to `STOCK`/`MUTUAL_FUND`/`ETF` (FR-005), shows validation errors inline (FR-007)
- [X] T026 [P] [US1] Component test for `CreatePortfolioForm` in `frontend/tests/CreatePortfolioForm.test.tsx`: valid submit shows the returned `portfolioId`; blank `name`/`currency` shows an error and does not call the create endpoint a second time (FR-003)
- [X] T027 [P] [US1] Component test for `AddInvestmentForm` in `frontend/tests/AddInvestmentForm.test.tsx`: valid submit shows the returned `holdingId`; blank `name`/`symbol` or an unsupported type shows an error (FR-007)

**Checkpoint**: User Story 1 is fully functional and independently testable.

---

## Phase 4: User Story 2 - Record Buy/Sell Transactions (Priority: P1)

**Goal**: A user can record BUY or SELL transactions against an existing holding from the
Portfolio Setup screen (spec.md US2).

**Independent Test**: Record a BUY transaction against an existing holding and confirm the
resulting transaction value (quantity × price) and updated holding quantity, independent of
dashboard display logic.

### Tests for User Story 2

- [X] T028 [P] [US2] Contract test for `POST /api/holdings/{holdingId}/transactions` in `backend/tests/contract/test_record_transaction.py`: valid BUY/SELL → 201 with `value == quantity * price`; `quantity <= 0` or `price <= 0` or unsupported `type` → 400; SELL `quantity` greater than currently held quantity → 400 with an error message containing "exceed" (FR-011); unknown `holdingId` → 404 (FR-008–FR-011)
- [X] T029 [P] [US2] Unit test for transaction rules in `backend/tests/unit/test_transaction_service.py` covering: held quantity = ΣBUY − ΣSELL (FR-012); average purchase price = ΣBUY value ÷ ΣBUY quantity and is unchanged by a SELL (FR-012a); a rejected over-sell leaves held quantity unchanged (FR-011); all monetary/quantity results rounded per FR-019a

### Implementation for User Story 2

- [X] T030 [US2] Implement holding-derivation helpers in `backend/app/services/holding_calculations.py`: `held_quantity(holding)` = ΣBUY quantity − ΣSELL quantity (FR-012); `average_purchase_price(holding)` = ΣBUY value ÷ ΣBUY quantity, unaffected by SELL transactions (FR-012a); both rounded via `rounding.py` (FR-019a)
- [X] T031 [US2] Implement `TransactionService.record_transaction` in `backend/app/services/transaction_service.py`: reject `type` not in `{BUY, SELL}`, `quantity <= 0`, or `price <= 0` (FR-010); 404 if `holdingId` does not exist; reject SELL where `quantity` exceeds `holding_calculations.held_quantity(holding)` with message "Sell quantity exceeds available holding quantity" (FR-011); compute `value = round_money(quantity * price)` (FR-009, FR-019a); generate id via `ids.generate_transaction_id()`
- [X] T032 [US2] Create Pydantic schemas in `backend/app/schemas/transaction.py` (`RecordTransactionRequest`, `Transaction`) exactly matching contracts/openapi.yaml
- [X] T033 [US2] Implement `POST /api/holdings/{holdingId}/transactions` in `backend/app/api/transactions.py` calling `TransactionService.record_transaction`; register router in `backend/app/main.py`
- [X] T034 [US2] Create `RecordTransactionForm` component in `frontend/src/components/RecordTransactionForm.tsx`, mounted on `PortfolioSetupPage` alongside T024/T025 (FR-022): calls `POST /api/holdings/{holdingId}/transactions`, surfaces the over-sell validation message clearly (FR-011, SC-003)
- [X] T035 [P] [US2] Component test for `RecordTransactionForm` in `frontend/tests/RecordTransactionForm.test.tsx`: valid BUY/SELL succeed; an over-sell attempt shows the clear error message and the displayed quantity is unchanged (FR-011)

**Checkpoint**: User Stories 1 AND 2 both work — the full Portfolio Setup screen is functional.

---

## Phase 5: User Story 3 - View Portfolio Dashboard, Holdings, and Performance (Priority: P2)

**Goal**: A user can view a single dashboard showing portfolio summary and the holdings list
with current price (spec.md US3).

**Independent Test**: Open the dashboard for a portfolio that already has holdings and
transactions, and verify displayed total invested amount, current value, and profit/loss match the
expected calculation from the underlying transaction data.

### Tests for User Story 3

- [X] T036 [P] [US3] Contract test for `GET /api/portfolios/{portfolioId}/holdings` in `backend/tests/contract/test_list_holdings.py`: returns each holding with `quantity`, `averagePrice`, `currentPrice`, `currentValue` (FR-016); returns `[]` for a portfolio with no holdings; 404 for unknown `portfolioId`
- [X] T037 [P] [US3] Contract test for `GET /api/portfolios/{portfolioId}/summary` in `backend/tests/contract/test_portfolio_summary.py`: `totalInvested`, `currentValue`, `profitLoss`, `profitLossPercentage` match the FR-018 formulas for a seeded set of transactions; all zero for a portfolio with no transactions (edge case); `profitLossPercentage` is `0` (not an error) when `totalInvested` is `0`; 404 for unknown `portfolioId`
- [X] T038 [P] [US3] Unit test for summary calculation in `backend/tests/unit/test_summary_service.py` covering FR-018 formulas and FR-019a rounding across multiple holdings

### Implementation for User Story 3

- [X] T039 [US3] Implement `HoldingService.list_holdings` in `backend/app/services/holding_service.py`: for each holding in the portfolio return `name`, `symbol`, `type`, `quantity` (via `holding_calculations.held_quantity`), `averagePrice` (via `holding_calculations.average_purchase_price`), `currentPrice`, `currentValue = round_money(quantity * currentPrice)` (FR-016)
- [X] T040 [US3] Implement `SummaryService.get_portfolio_summary` in `backend/app/services/summary_service.py`: `totalInvested = round_money(ΣBUY value − ΣSELL value)`; `currentValue = round_money(Σ(holding.quantity * holding.currentPrice))`; `profitLoss = round_money(currentValue - totalInvested)`; `profitLossPercentage = round_money(profitLoss / totalInvested * 100)` or `0` when `totalInvested == 0` (FR-017, FR-018)
- [X] T041 [US3] Implement `GET /api/portfolios/{portfolioId}/holdings` in `backend/app/api/holdings.py` calling `HoldingService.list_holdings` (FR-016); 404 for unknown portfolio; register router in `backend/app/main.py`
- [X] T042 [US3] Implement `GET /api/portfolios/{portfolioId}/summary` in `backend/app/api/portfolios.py` calling `SummaryService.get_portfolio_summary` (FR-017); 404 for unknown portfolio; register router in `backend/app/main.py`
- [X] T043 [US3] Create `PortfolioDashboardPage` in `frontend/src/pages/PortfolioDashboardPage.tsx` with `HoldingsTable` (`frontend/src/components/HoldingsTable.tsx`) and `SummaryPanel` (`frontend/src/components/SummaryPanel.tsx`): fetch and render holdings (FR-016) and summary (FR-017)
- [X] T044 [US3] Wire "add investment" and "record transaction" actions on `PortfolioDashboardPage` to the existing `AddInvestmentForm` (T025) and `RecordTransactionForm` (T034) components in place, without introducing a third screen (FR-023, FR-024)
- [X] T045 [P] [US3] Component test for the dashboard in `frontend/tests/PortfolioDashboardPage.test.tsx`: holdings and summary render with expected values from a seeded API response; the dashboard's add-investment/record-transaction actions render the same forms as the Portfolio Setup screen (FR-023)

**Checkpoint**: User Stories 1, 2, and 3 all work together — the dashboard is fully functional.

---

## Phase 6: User Story 4 - Update Current Price of a Holding (Priority: P3)

**Goal**: A user can manually update a holding's current price from the Portfolio Dashboard
(spec.md US4).

**Independent Test**: Update the current price of an existing holding and confirm the holding's
displayed current value and the portfolio summary recalculate using the new price.

### Tests for User Story 4

- [X] T046 [P] [US4] Contract test for `PUT /api/holdings/{holdingId}/price` in `backend/tests/contract/test_update_price.py`: valid `{currentPrice > 0}` → 200 with the updated `currentPrice`; `currentPrice <= 0` → 400; unknown `holdingId` → 404 (FR-013, FR-014)
- [X] T047 [P] [US4] Unit test for price-update rules in `backend/tests/unit/test_price_service.py` covering FR-013–FR-015 (rejects non-positive price and unknown holding; never fetches from an external source)

### Implementation for User Story 4

- [X] T048 [US4] Implement `HoldingService.update_current_price` in `backend/app/services/holding_service.py`: reject `currentPrice <= 0` (FR-014); 404 if `holdingId` does not exist; persist `round_money(currentPrice)`; no external price lookup is ever performed (FR-015)
- [X] T049 [US4] Create Pydantic schemas in `backend/app/schemas/holding.py` (`UpdatePriceRequest`, `PriceUpdateResult`) exactly matching contracts/openapi.yaml
- [X] T050 [US4] Implement `PUT /api/holdings/{holdingId}/price` in `backend/app/api/holdings.py` calling `HoldingService.update_current_price`; register router in `backend/app/main.py`
- [X] T051 [US4] Create `UpdatePriceForm` component in `frontend/src/components/UpdatePriceForm.tsx`, mounted on `PortfolioDashboardPage` (FR-013, FR-023): calls `PUT /api/holdings/{holdingId}/price`, refreshes the holding's displayed current value and the portfolio summary on success
- [X] T052 [P] [US4] Component test for `UpdatePriceForm` in `frontend/tests/UpdatePriceForm.test.tsx`: a valid update recalculates the displayed current value; a non-positive price shows a validation error (FR-014)

**Checkpoint**: All 4 user stories, all 6 endpoints, and both screens are fully functional.

---

## Phase 7: Polish & Cross-Cutting Concerns

- [X] T053 [P] Walk through quickstart.md Validation Scenario 1 and Scenario 2 end-to-end against the running app and record the outcome (pass/fail per step) in a short note at the bottom of `specs/001-wealth-management-poc/quickstart.md`
- [X] T054 [P] Write `README.md` at the repository root documenting the setup/run steps from quickstart.md
- [X] T055 Cross-check every FR-001–FR-026 in `spec.md` against the implemented routes/components and confirm none was dropped or altered by the 2-screen UI consolidation (FR-024, FR-025)
- [X] T056 Run the full backend suite (`pytest backend/tests`) and frontend suite (`npm run test` in `frontend/`) and fix any failures before considering the feature done

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **Foundational (Phase 2)**: Depends on Setup. Blocks all user stories.
- **User Story 1 (Phase 3)**: Depends on Foundational only.
- **User Story 2 (Phase 4)**: Depends on Foundational; uses the `Holding` created by US1 for its
  own independent test, but does not depend on US1's code being merged first — it can be built in
  parallel by a second developer using a holding seeded directly in the test database.
- **User Story 3 (Phase 5)**: Depends on Foundational; independently testable by seeding
  holdings/transactions directly (no dependency on US1/US2 code, only on the data they would have
  produced).
- **User Story 4 (Phase 6)**: Depends on Foundational; independently testable against a seeded
  holding.
- **Polish (Phase 7)**: Depends on all four user stories being complete.

### Notes on File-Level Sequencing

- T022/T023 (US1), T033 (US2), T041/T042 (US3), and T050 (US4) all register routers in
  `backend/app/main.py`. They are not marked `[P]` against each other — apply them in phase order
  even if stories are otherwise developed in parallel.
- T024/T025 (US1), T034 (US2), and T044 (US3) all touch `PortfolioSetupPage.tsx` /
  `PortfolioDashboardPage.tsx` composition. Within a page, add components sequentially even when
  the component files themselves are created in parallel.

### Parallel Opportunities

- All Setup `[P]` tasks (T003, T004) run in parallel after T001/T002.
- Foundational model tasks T006/T007/T008 run in parallel (different files); T009, T010, T012,
  T013, T014 run in parallel with them and each other.
- Once Foundational is complete, US1, US2, US3, and US4 backend service/test tasks can be staffed
  in parallel by different developers (each touches its own service/schema/test files); only the
  shared `main.py` registrations and shared page files need sequencing per story completion order.

---

## Parallel Example: User Story 1

```bash
# Tests together:
Task: "Contract test for POST /api/portfolios in backend/tests/contract/test_create_portfolio.py"
Task: "Contract test for POST /api/portfolios/{portfolioId}/holdings in backend/tests/contract/test_add_holding.py"
Task: "Unit test for portfolio creation rules in backend/tests/unit/test_portfolio_service.py"
Task: "Unit test for holding creation rules in backend/tests/unit/test_holding_service.py"

# Frontend forms together (after their backend endpoints exist):
Task: "Create CreatePortfolioForm component in frontend/src/components/CreatePortfolioForm.tsx"
Task: "Create AddInvestmentForm component in frontend/src/components/AddInvestmentForm.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (blocks everything else)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: create a portfolio and a holding through the Portfolio Setup screen and
   confirm both generated ids display correctly
5. Demo if ready

### Incremental Delivery

1. Setup + Foundational → foundation ready
2. Add User Story 1 → test independently → demo (MVP)
3. Add User Story 2 → test independently → demo (Portfolio Setup screen complete)
4. Add User Story 3 → test independently → demo (Portfolio Dashboard readable)
5. Add User Story 4 → test independently → demo (all 6 endpoints, both screens, fully functional)
6. Polish

### Parallel Team Strategy

With multiple developers, once Foundational is done: Developer A takes US1, Developer B takes
US2 (using a directly-seeded holding for its independent test), Developer C takes US3 (using
directly-seeded holdings/transactions), Developer D takes US4 — then integrate the shared
`main.py` router registrations and the two page files in priority order (US1 → US2 → US3 → US4).

---

## Notes

- `[P]` tasks touch different files with no unmet dependency.
- `[Story]` labels map every Phase 3+ task to spec.md's US1–US4 for traceability.
- Every business rule/calculation task quotes its governing FR-ID(s) so no rule is left to
  implementation-time discretion (data-model.md, contracts/openapi.yaml).
- Tests are written before their corresponding implementation task within each story, per
  Constitution Principle III.
- Commit after each task or logical group; stop at any checkpoint to validate a story
  independently before continuing.
