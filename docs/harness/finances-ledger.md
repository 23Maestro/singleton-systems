# Finances ledger

`/finances` is a private personal ledger. The browser receives an HTTP-only
session cookie after Jerami enters the configured access token.

Required server variables:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `FINANCES_ACCESS_TOKEN` with at least 24 characters

The service-role key stays on the server. Every finance API route rejects a
missing or invalid finance session.

`FINANCES_PREVIEW_OPEN_ACCESS=true` can open a Vercel Preview without a login
screen. The switch has no effect outside the Vercel Preview environment.

Debt promotion uses one database function. It locks the debt row, rejects an
overpayment, reduces the balance, and records the payment in one transaction.
Both changes commit together or neither does.

Repository checks do not apply migrations. Review and approve the live
Supabase migration before running it against production.
