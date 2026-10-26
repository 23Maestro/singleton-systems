# Finances ledger

## Product intent

`/finances` is Jerami's personal cash-flow app. It requires one finance
passphrase per trusted device and stores a signed, HTTP-only session for one
year. The finance APIs enforce the same session. Rotating
`FINANCES_ACCESS_TOKEN` invalidates every trusted device.

The page is not linked from the public site, Links page, or Visual Maps, and it
remains `noindex`. Those discovery controls do not replace authentication.

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

## Remove a Plan item

The Plan editor has a Delete checkbox opposite Active. Checking Delete changes
the save action to Delete item. Confirmation sends `save-item` with
`remove: true` and the saved item snapshot to `/api/finances/ledger`. The server rejects
stale snapshots and commits removal through the existing Supabase transaction.
Cash, recorded transactions, and payment history stay unchanged. The item no
longer appears in Plan or future calendar reminders.

## Calendar view

The finance tabs are Home, Entry, Calendar, and Plan. Calendar uses
`/finances-calendar`. The route keeps the finance layout and noindex headers.

Calendar shows saved due dates and recorded cash activity. Repeats use the
saved date or day of month. A day beyond the month ends on that month's last
day. Weekly repeats keep their day across daylight saving changes.

Due dates do not change cash or mark a bill paid. Amount ranges stay as ranges.
Debt reminders use the saved payment amount. A missing payment amount stays
unset. Active items with no usable schedule stay in a list below the month.

Home, Entry, Calendar, and Plan use local shadcn controls, cards, tabs, dialogs,
date pickers, labels, alerts, and payment-history expansion. Icons use bundled
Evil Icons. Provider logos stay
local. Calendar reads the same ledger snapshot as Home and Plan.

## Database safety

Debt promotion uses one database function. It locks the debt row, rejects an
overpayment, reduces the balance, and records the payment in one transaction.
Both changes commit together or neither does.

Repository checks do not apply migrations. Review and approve the live
Supabase migration before running it against production.

## Debt payoff progress

The reviewed build adds the payoff tracker to Plan. Live release is
pending Jerami's review. The tracker covers debts and advances. Habitica was
the gamification reference: reward saved progress and milestones. This pass
adds a brief success animation and milestones every $500. It adds no streak
penalties, avatars or new animation package.

Total paid off starts from an approved opening total. Imported Resolve rows
are not counted again. Only new payments marked for payoff progress and new
progress-only credits increase it. Remaining debt includes positive debt and
advance balances. Unknown balances and ranges stay labeled.

Debt payments and Resolve require an explicit Yes or No to cash deduction.
Yes deducts cash. No records the payment and reduces debt while preserving
cash. Progress-only credits increase paid-off progress without changing cash,
remaining balances, or schedules. The aggregate Add past payment form needs
no creditor name. All writes use the existing ledger transaction and replay
checks. Success rewards fire after a confirmed write, not on reload or polling.
Reduced motion removes the burst animation.

The `debt-progress` command can set the opening total once or add a catch-up
credit. The opening figures stay in saved user data, not source. These writes
use the payment category in the existing operation journal. No SQL migration
or access change is required. Payment rows retain cash-deduction and progress
flags. Cash-only activity views exclude non-cash credits.

## Debt repeat endings

Only `planType: debt` has Ends controls: No end set, After payments, or On a
date. Bills, subscriptions and advances keep their repeat fields. Deleting an
item ends future reminders and preserves its history.

A count means payments still remaining, excluding payments already made.
The first remaining due date anchors the schedule. The form suggests a count
from the remaining balance and usual payment; it stays editable. Each recorded
debt payment consumes 1 occurrence and advances the first remaining due date.
Progress-only credits leave that count and date unchanged. An exhausted
schedule leaves any unpaid debt visible. Only an actual payment reduces debt.

Repeat bounds are validated on the server. End dates include the selected day.
Month-end clamping and daylight-saving behavior stay in the shared schedule
helper. The date picker and keyboard viewport handling are reused.

## Mobile review

Form scroll areas leave 8 px for the shared 6 px focus outline. Plan filters
wrap. Date-picker actions and modal footers have room for focus rings and
shadows. A short viewport is checked in Chrome; actual iPhone keyboard behavior
still needs Jerami's device review.

Plan actions share 1 horizontal row below each item on mobile and tablet.
Payment comes first, followed by Resolve when shown, then a labeled Edit
button. Targets are at least 44 px. The small press response respects reduced
motion. Desktop keeps the same action order beside the amount.

Reference: https://github.com/habitrpg/habitica
