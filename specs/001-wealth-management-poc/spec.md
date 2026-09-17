# Feature Specification: Personal Wealth Management System POC

**Feature Branch**: `001-wealth-management-poc`

**Created**: 2026-09-17

**Status**: Draft

**Input**: User description: "Use docs/Personal_Wealth_Management-SpecKit_SDD_POC.pdf as the authoritative source specification. Create the feature specification for the Personal Wealth Management System POC based strictly on that document, with the intentional UI constraint of a maximum of TWO UI screens (Portfolio Setup: Create Portfolio, Add Investment, Record BUY/SELL Transaction; Portfolio Dashboard: Portfolio summary, Holdings, Current price, and actions for adding investments, recording transactions, and updating prices). The UI consolidation must not remove or change any backend functionality, APIs, entities, calculations, validation rules, HTTP error behavior, repository structure, testing expectations, or out-of-scope boundaries defined in the source document."

## Clarifications

### Session 2026-09-17

- Q: How should a holding's "Average Purchase Price" be calculated once SELL transactions are involved? → A: Weighted average of BUY transactions only (total BUY value ÷ total BUY quantity); unaffected by SELL transactions.
- Q: What should a holding's "current price" show before the user has ever performed an explicit "update current price" action for it? → A: Current price defaults to 0 (and current value is therefore 0) until explicitly updated.
- Q: How many decimal places should monetary amounts and quantities be rounded to for storage and display? → A: Money rounded to 2 decimal places; quantity rounded to 4 decimal places.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Set Up a Portfolio and Its Holdings (Priority: P1)

A user starts with nothing and needs to create a personal investment
portfolio, then add one or more investment holdings (stocks, mutual
funds, or ETFs) to it, all from a single consolidated setup screen.

**Why this priority**: Without a portfolio and at least one holding,
no other capability (recording transactions, viewing performance) is
reachable. This is the entry point and MVP slice of the system.

**Independent Test**: Can be fully tested by creating a portfolio,
confirming a portfolio ID is generated and displayed, then adding an
investment to that portfolio and confirming a holding ID is generated
— without needing any transaction or dashboard functionality.

**Acceptance Scenarios**:

1. **Given** a user is on the Portfolio Setup screen with no existing
   portfolio, **When** they submit a portfolio name and a base
   currency, **Then** the system creates the portfolio, generates a
   unique portfolio identifier, and displays confirmation including
   that identifier.
2. **Given** a portfolio has been created, **When** the user submits
   an investment name, symbol, and a supported investment type
   (STOCK, MUTUAL_FUND, or ETF) on the same screen, **Then** the
   system creates a holding linked to that portfolio and generates a
   unique holding identifier.
3. **Given** a portfolio name or currency is left blank, **When** the
   user submits the Create Portfolio form, **Then** the system
   rejects the submission and displays a validation error without
   creating a portfolio.
4. **Given** an investment name or symbol is left blank, or an
   unsupported investment type is chosen, **When** the user submits
   the Add Investment form, **Then** the system rejects the
   submission and displays a validation error without creating a
   holding.

---

### User Story 2 - Record Buy/Sell Transactions (Priority: P1)

A user with an existing holding needs to record BUY or SELL
transactions (quantity, price per unit, and date) from the Portfolio
Setup screen, so that the holding's quantity and invested amount stay
accurate.

**Why this priority**: Recording transactions is the core data-entry
activity that drives every downstream calculation (holdings,
portfolio value, profit/loss). Without it, the dashboard has nothing
meaningful to display.

**Independent Test**: Can be fully tested by recording a BUY
transaction against an existing holding and confirming the resulting
transaction value (quantity × price) and updated holding quantity,
independent of dashboard display logic.

**Acceptance Scenarios**:

1. **Given** an existing holding, **When** the user records a BUY
   transaction with a positive quantity and a positive price, **Then**
   the system creates the transaction, computes its value as quantity
   × price, and increases the holding's quantity accordingly.
2. **Given** an existing holding with a currently held quantity,
   **When** the user records a SELL transaction with a quantity less
   than or equal to the currently held quantity, **Then** the system
   creates the transaction and decreases the holding's quantity
   accordingly.
3. **Given** an existing holding with a currently held quantity,
   **When** the user attempts to record a SELL transaction with a
   quantity greater than the currently held quantity, **Then** the
   system rejects the transaction and displays a clear validation
   message without changing the holding's quantity.
4. **Given** a transaction submission with a zero or negative
   quantity, or a zero or negative price, **When** the user submits
   it, **Then** the system rejects the transaction and displays a
   validation error.
5. **Given** a transaction is submitted for a holding that does not
   exist, **When** the user submits it, **Then** the system rejects
   the transaction with a not-found error.

---

### User Story 3 - View Portfolio Dashboard, Holdings, and Performance (Priority: P2)

A user with an established portfolio needs a single dashboard screen
that shows overall portfolio value, profit/loss, and the detailed
list of holdings (including current price), so they can assess how
their investments are performing.

**Why this priority**: Viewing performance is the payoff of the data
entered in User Stories 1 and 2. It depends on a portfolio and at
least one holding/transaction already existing, so it is sequenced
after them, but it is still core to the POC's value proposition.

**Independent Test**: Can be fully tested by opening the dashboard for
a portfolio that already has holdings and transactions, and verifying
that displayed total invested amount, current value, and profit/loss
match the expected calculation from the underlying transaction data.

**Acceptance Scenarios**:

1. **Given** a portfolio with one or more holdings, **When** the user
   opens the Portfolio Dashboard, **Then** the system displays, for
   each holding: investment name, symbol, type, quantity, average
   purchase price, current price, and current value.
2. **Given** a portfolio with recorded transactions, **When** the user
   opens the Portfolio Dashboard, **Then** the system displays total
   invested amount, current portfolio value, profit/loss, and
   profit/loss percentage, computed from the underlying holdings and
   transactions.
3. **Given** the Portfolio Dashboard is open, **When** the user
   triggers the "add investment" action, **Then** the system provides
   the same investment-creation capability as User Story 1 (either by
   navigating to the Portfolio Setup screen or an equivalent inline
   flow), without introducing a third screen.
4. **Given** the Portfolio Dashboard is open, **When** the user
   triggers the "record transaction" action, **Then** the system
   provides the same transaction-recording capability as User Story 2
   for a holding shown on the dashboard.

---

### User Story 4 - Update Current Price of a Holding (Priority: P3)

A user needs to manually update the current price of an existing
holding from the Portfolio Dashboard, since the system does not
retrieve prices from any market-data provider.

**Why this priority**: Price updates refine the accuracy of value and
performance figures already shown in User Story 3, but the dashboard
is still meaningful (using the price captured at holding creation)
without this capability, so it is the lowest-priority independent
slice.

**Independent Test**: Can be fully tested by updating the current
price of an existing holding and confirming the holding's displayed
current value and the portfolio summary recalculate using the new
price.

**Acceptance Scenarios**:

1. **Given** an existing holding, **When** the user submits a new
   current price greater than zero, **Then** the system updates the
   holding's current price and subsequent value/performance displays
   reflect it.
2. **Given** an existing holding, **When** the user submits a current
   price of zero or a negative value, **Then** the system rejects the
   update and displays a validation error.
3. **Given** a price update is submitted for a holding that does not
   exist, **When** the user submits it, **Then** the system rejects
   the update with a not-found error.

---

### Edge Cases

- What happens when a user submits Create Portfolio, Add Investment,
  or Record Transaction with all required fields technically present
  but of the wrong data type (e.g., non-numeric quantity/price)? The
  system MUST reject the submission with a validation error rather
  than silently coercing or truncating the value.
- What happens when a SELL transaction's quantity exactly equals the
  currently held quantity? This MUST be accepted (bringing the held
  quantity to zero), consistent with "cannot exceed" rather than
  "must remain positive."
- What happens when a user tries to add a holding to a portfolio ID
  that does not exist? The system MUST reject the request with a
  not-found error.
- What happens when a user tries to view holdings, the summary, or
  update the price for a portfolio/holding with no transactions yet?
  The system MUST display zero/empty values rather than erroring.
- What happens when a user views a holding that has transactions but
  whose current price has never been explicitly updated? The system
  MUST show its current price (and current value) as 0 rather than
  substituting a purchase price or erroring.
- How does the system behave when two transactions are submitted for
  the same holding in immediate succession? Each MUST be processed
  independently and reflected cumulatively in the holding's quantity
  and the portfolio's calculations.

## Requirements *(mandatory)*

### Functional Requirements

**Portfolio management**

- **FR-001**: The system MUST allow a user to create a portfolio by
  providing a portfolio name and a base currency, both of which are
  mandatory. Currency MUST be selected from a fixed, small list of
  supported currency codes (e.g., INR, USD), not free text.
- **FR-002**: The system MUST generate a unique portfolio identifier
  upon successful portfolio creation and return/display it to the
  user.
- **FR-003**: The system MUST reject portfolio creation when the name
  or currency is missing, or when the currency is not one of the
  supported currency codes, with a validation error, and MUST NOT
  create a partial portfolio record.

**Holding management**

- **FR-004**: The system MUST allow a user to add an investment
  holding to an existing portfolio by providing an investment name, a
  symbol, and an investment type.
- **FR-005**: The system MUST restrict investment type to the
  supported set: STOCK, MUTUAL_FUND, ETF, and MUST reject any other
  value.
- **FR-006**: The system MUST generate a unique holding identifier
  upon successful holding creation, linked to its parent portfolio.
- **FR-006a**: The system MUST initialize a newly created holding's
  current price to 0 (and therefore its current value to 0) until the
  user explicitly updates the current price.
- **FR-007**: The system MUST reject holding creation when the
  investment name or symbol is missing, when the investment type is
  unsupported, or when the referenced portfolio does not exist. Adding
  an investment whose symbol already exists as a holding in the same
  portfolio MUST be allowed and MUST create a new, independent holding
  rather than being rejected or merged into the existing one.

**Transaction management**

- **FR-008**: The system MUST allow a user to record a BUY or SELL
  transaction against an existing holding, capturing transaction
  type, quantity, price per unit, and transaction date. Quantity and
  price per unit MUST accept decimal (fractional) values, not just
  whole numbers.
- **FR-009**: The system MUST compute each transaction's value as
  quantity × price per unit.
- **FR-010**: The system MUST reject a transaction when quantity is
  not greater than zero, when price is not greater than zero, when
  transaction type is not BUY or SELL, or when the referenced holding
  does not exist.
- **FR-011**: The system MUST reject a SELL transaction whose quantity
  exceeds the holding's currently held quantity, and MUST display a
  clear validation message describing the rejection.
- **FR-012**: The system MUST update a holding's held quantity as a
  running total of BUY quantities minus SELL quantities.
- **FR-012a**: The system MUST calculate a holding's average purchase
  price as the weighted average price of its BUY transactions only
  (total BUY value ÷ total BUY quantity); a SELL transaction MUST NOT
  change the average purchase price.

**Price maintenance**

- **FR-013**: The system MUST allow a user to manually update the
  current price of an existing holding.
- **FR-014**: The system MUST reject a current-price update that is
  not greater than zero, or that targets a holding that does not
  exist.
- **FR-015**: The system MUST NOT retrieve prices from any external
  market-data source; current price is always manually maintained.

**Viewing holdings and performance**

- **FR-016**: The system MUST allow a user to view all holdings in a
  portfolio, displaying for each: investment name, symbol, type,
  quantity, average purchase price, current price, and current value
  (quantity × current price).
- **FR-017**: The system MUST allow a user to view an overall
  portfolio summary displaying: total invested amount, current
  portfolio value, profit/loss, and profit/loss percentage.
- **FR-018**: The system MUST calculate total/net invested amount as
  the sum of BUY transaction values minus the sum of SELL transaction
  values, current value as the sum of (holding quantity × current
  price) across holdings, profit/loss as current value minus net
  invested amount, and profit/loss percentage as (profit/loss ÷ net
  invested amount) × 100.
- **FR-019**: The system MUST NOT implement FIFO/LIFO, tax-lot
  tracking, capital-gains, or tax calculations as part of any
  calculation in this feature.
- **FR-019a**: The system MUST round all monetary amounts (prices,
  transaction values, invested amount, current value, profit/loss) to
  2 decimal places, and all quantities (holding quantity, transaction
  quantity) to 4 decimal places, for both storage and display.

**Error handling**

- **FR-020**: The system MUST reject invalid requests (missing
  required fields, unsupported values, business-rule violations such
  as over-selling) using a client-error response category distinct
  from not-found and conflict cases, and MUST reject requests that
  reference a non-existent portfolio or holding using a not-found
  response category.
- **FR-021**: Every rejected request MUST include a human-readable
  error message describing why it was rejected (e.g., "Sell quantity
  exceeds available holding quantity").

**UI consolidation constraint**

- **FR-022**: The system MUST expose all of Create Portfolio, Add
  Investment, and Record BUY/SELL Transaction on a single "Portfolio
  Setup" screen.
- **FR-023**: The system MUST expose portfolio summary, the holdings
  list (with current price), and the actions to add an investment,
  record a transaction, and update a current price, all reachable
  from a single "Portfolio Dashboard" screen.
- **FR-024**: The system MUST NOT introduce more than two distinct UI
  screens to deliver the capabilities in FR-001 through FR-017; where
  the source workflow implies more steps, they MUST be consolidated
  as sections, panels, or modal interactions within one of the two
  screens rather than as separate screens.
- **FR-025**: The two-screen UI consolidation MUST NOT remove, hide by
  default without a reachable action, or otherwise reduce any backend
  capability, validation rule, or calculation described in FR-001
  through FR-021.

**Out of scope**

- **FR-026**: The system MUST NOT implement: real-time market data
  retrieval, stock-exchange (e.g., NSE/BSE) integration, brokerage
  integration, bank account integration, mutual fund provider
  integration, user authentication/SSO, tax calculation, capital-gains
  tax, dividend tracking, SIP automation, financial advice or
  investment recommendations (including AI-generated ones), portfolio
  optimization, notifications, multi-user access control, or advanced
  charting.

### Key Entities *(include if feature involves data)*

- **Portfolio**: A user's named investment container. Key attributes:
  portfolio identifier (unique), name, base currency, creation
  timestamp. One portfolio has many holdings.
- **Holding**: A single investment position within a portfolio. Key
  attributes: holding identifier (unique), parent portfolio
  identifier, investment name, symbol, investment type (STOCK /
  MUTUAL_FUND / ETF), current price (defaults to 0 until explicitly
  updated), creation timestamp. Its held
  quantity is derived as the running total of BUY minus SELL
  quantities; its average purchase price is derived as the weighted
  average price of its BUY transactions only (total BUY value ÷ total
  BUY quantity), unaffected by SELL transactions. One holding has many
  transactions.
- **Transaction**: A single BUY or SELL event against a holding. Key
  attributes: transaction identifier (unique), parent holding
  identifier, transaction type (BUY / SELL), quantity, price per unit,
  transaction date, creation timestamp, and computed value (quantity ×
  price).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can go from having no portfolio to viewing a
  dashboard showing at least one holding with a nonzero current value,
  using only the two defined screens, in a single sitting with no
  more than the minimum required data entry steps (create portfolio,
  add investment, record one transaction).
- **SC-002**: 100% of portfolio value and profit/loss figures shown on
  the dashboard match, to the specified rounding precision (money to 2
  decimal places, quantity to 4 decimal places), the values obtained by
  manually applying the documented calculation formulas to the same
  underlying transaction and price data.
- **SC-003**: 100% of attempts to sell more units than currently held
  are rejected with a clear, user-visible message, and the held
  quantity is unchanged after the rejected attempt.
- **SC-004**: 100% of the six required operations (create portfolio,
  add holding, record transaction, view holdings, update current
  price, view portfolio summary) remain available to the user through
  the two-screen UI, with no operation requiring a third screen.
- **SC-005**: Every functional requirement in this specification traces
  to a specific section of the source document
  (`docs/Personal_Wealth_Management-SpecKit_SDD_POC.pdf`) or to an
  explicitly stated UI-consolidation constraint, with no invented
  capability outside that document's scope.

## Assumptions

- The base currency captured at portfolio creation is stored and
  displayed for reference/labeling purposes only; this feature does
  not perform currency conversion between portfolios or transactions.
  Currency is restricted to a fixed, small list of supported codes
  (e.g., INR, USD), resolved during specification review.
- Holding quantity and transaction quantity/price are decimal numbers
  capable of representing fractional units (e.g., fractional mutual
  fund/ETF units). Resolved during specification review. Monetary
  amounts are rounded to 2 decimal places and quantities to 4 decimal
  places for storage and display (resolved during clarification).
- Adding an investment whose symbol already matches an existing
  holding in the same portfolio creates a new, independent holding
  rather than being rejected or merged. Resolved during specification
  review.
- A portfolio, once created, is not deletable or renamable within this
  feature's scope — only creation and downstream additions are
  specified.
- "Average Purchase Price" for a holding is the quantity-weighted
  average price of its BUY transactions only (total BUY value ÷ total
  BUY quantity) and does not change when a SELL transaction is
  recorded, consistent with the source document's exclusion of
  FIFO/LIFO/tax-lot precision. Resolved during clarification.
- The two required UI screens may use in-page navigation, tabs, or
  modals to present the consolidated workflows (e.g., Add Investment
  and Record Transaction both living on the Portfolio Setup screen),
  as long as no more than two distinct top-level screens exist.
