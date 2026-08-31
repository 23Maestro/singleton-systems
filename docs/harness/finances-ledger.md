# Finances ledger

## Product intent

`/finances` is Jerami's personal cash-flow app. It has no login, access token,
or Lock action. It is not linked from the public site, Links page, or Visual
Maps.

Jerami enters real income and spending by hand. The app does not sync a bank
account. Its cash figure must match the balance Jerami reports.

Freelance income is irregular. The app plans from money received. It does not
assume a future paycheck amount.

## Current calculation defect

The current page calculates:

`all income - all paid bills - all expenses - all unpaid bills`

It does not filter entries to the active pay cycle. An unpaid bill reduces the
displayed cash before Jerami chooses to fund it. This calculation must change.

## Glossary

- Reported cash balance: The checking balance Jerami enters as current truth.
- Pay cycle: The active planning window for received income and selected costs.
- Received income: Money that has arrived and can be assigned now.
- Planned bill: A known obligation with an amount. It does not reduce cash
  before payment or funding.
- Subscription: A repeating planned bill with a required due date.
- Debt candidate: A debt balance that is visible for planning. It does not
  reduce cash by itself.
- Promote: Jerami chooses an amount from a debt candidate for the active pay
  cycle. The promoted amount becomes planned for payment.
- Available cash: Reported cash minus transactions that have reduced the bank
  balance. Planned items need a separate figure until their treatment is set.

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
