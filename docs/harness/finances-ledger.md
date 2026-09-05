# Finances ledger

## Product intent

`/finances` is Jerami's personal cash-flow app. It has no login, access token,
or Lock action. It is not linked from the public site, Links page, or Visual
Maps.

Jerami enters real income and spending by hand. The app does not sync a bank
account. Its cash figure must match the balance Jerami reports.

Unison is a hard invariant. The app cash balance and the bank cash balance must
agree. A mismatch is an error to resolve, not a normal state to display.

A due bill does not change cash. If the bank has `$59`, the ledger cash balance
is `$59`. When a `$2,000` deposit arrives and Jerami logs it as income, both
balances become `$2,059`.

Freelance income is irregular. The app plans from money received. It does not
assume a future paycheck amount.

## Current calculation defect

The current page calculates:

`all income - all paid bills - all expenses - all unpaid bills`

It does not filter entries to the active pay cycle. An unpaid bill reduces the
displayed cash before Jerami chooses it for payment. This calculation must
change.

## Glossary

- Unison: The app cash balance and bank cash balance agree.
- Reported cash balance: The checking balance Jerami enters as current truth.
- Cash balance: Opening cash plus received income minus completed cash
  transactions. Due dates and planned items do not change it.
- Pay cycle: The active planning window for received income and selected costs.
- Received income: Money that has arrived and can be assigned now.
- Planned bill: A known obligation with an amount. It does not reduce cash
  before payment.
- Subscription: A repeating planned bill with a required due date.
- Debt candidate: A debt balance that is visible for planning. It does not
  reduce cash by itself.
- Promote: Jerami chooses an amount from a debt candidate for the active pay
  cycle. The promoted amount becomes planned for payment.

These are internal definitions, not required home-page labels. The interface
should not turn every calculation or state into a prominent number.

## 23Space source review

The useful flow in the existing Notion setup is simple:

- one `Enter Money` form backed by the Budget database;
- an activity list filtered to the current half of the month;
- recurring bills stored separately from debt balances;
- debt payments related back to the debt they reduce.

The form's core fields are Entry, Amount, Date, Type, Category, and optional
Debt Item. Income and expenses become signed ledger entries. The current-check
view derives the pay cycle from the entry date.

Preserve the single-entry flow and the separation between cash activity,
recurring obligations, and depleting debt balances. Do not copy the Notion
setup's blank rows, optional transaction type, negative amount ambiguity,
duplicate entries, or text-only due dates. The app should require a transaction
type, accept a positive amount, assign the sign from the type, and use real
dates for bills and subscriptions.

The home page should be reduced before its information architecture is
finalized. The existing cluster of summary numbers is not the product model.

## Working screen split

Keep the current visual style. Split the compressed page into three routes.

- `/finances` holds the current pay cycle and its payment actions.
- `/finances-form` handles quick cash entries. Every entry requires a category,
  date, and income or expense type.
- The overview route shows the Supabase records for subscriptions and bills.
  It also shows debts. Editing those records happens on this route.

The quick form is for income and everyday spending. It can also record a
variable payment against a saved item. Saved bills and subscriptions keep their
own editable amount and date on the overview route.

The four-number summary is removed from the current home page.

Balance placement is still open.

## Reference models

YNAB assigns only money already on hand and lets the user move money between
categories when plans change:
https://www.ynab.com/the-four-rules/

EveryDollar creates a zero-based monthly plan. It also has paycheck planning
that uses dates for when money should be available:
https://everydollar.help.ramseysolutions.com/hc/en-us/articles/360032786691-Getting-Started-with-EveryDollar
https://everydollar.help.ramseysolutions.com/hc/en-us/articles/11298446782477-Paycheck-Planning-FAQ

## Database safety

Debt promotion uses one database function. It locks the debt row, rejects an
overpayment, reduces the balance, and records the payment in one transaction.
Both changes commit together or neither does.

Repository checks do not apply migrations. Review and approve the live
Supabase migration before running it against production.
