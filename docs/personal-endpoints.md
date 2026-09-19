# Personal endpoints

Jerami requested direct access on September 19, 2026. These pages require no
passphrase, account, browser registration, or session cookie:

- `/fitness`
- `/finances`, including existing `/finances-form` and `/finances-plan` shortcuts
- `/dashboard` and `/command-center`

Browser components load their data immediately. The old session endpoints
return `access: "open"` for compatibility with previously loaded clients.
Connection errors remain connection errors; the page offers a connection retry.
Server credentials, input validation, and save conflict handling remain in
the server integrations. Do not change existing workout or finance records to
test access.

## Release together

All surfaces belong to the same Vercel project and production deployment.
Integrate accepted work into the production branch before publishing. Deploying
an isolated worktree replaces the whole site; it does not append that worktree's
pages to production. Do not restore an old Fitness-only deployment over Dashboard.

`npm run prebuild` checks that every personal endpoint is included. After a
release, run `node scripts/check-personal-endpoints.mjs https://singleton-systems.com`
and inspect all three pages in the browser. The readback sends no cookies and
performs no writes.
