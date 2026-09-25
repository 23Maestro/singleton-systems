# Personal endpoints

Jerami requested direct access on September 19, 2026. These pages require no
passphrase, account, browser registration, or session cookie:

- `/business-ops`: exactly Command Center (`/dashboard`), Fitness, and Finances
- `/decision-maps`: current review links; retired Future Voices and CYB work stays removed
- `/fitness`
- `/finances`, including existing `/finances-form` and `/finances-plan` shortcuts
- `/dashboard` and `/command-center`

Browser components load their data immediately. The old session endpoints
return `access: "open"` for compatibility with previously loaded clients.
Connection errors remain connection errors; the page offers a connection retry.
Server credentials, input validation, and save conflict handling remain in
the server integrations. Do not change existing workout or finance records to
test access.

## Vercel preview access

Jerami reaffirmed no passcodes or login gates on September 24, 2026, including
previews. The `singleton-systems` Vercel project has `ssoProtection: null` and
`passwordProtection: null`. Keep both disabled. Use direct preview URLs without
expiring share tokens. Do not reintroduce passphrases, login gates, or browser
registration unless Jerami explicitly changes this requirement.

The former `/business-links` address redirects to `/business-ops`.

## Release together

All surfaces belong to the same Vercel project and production deployment.
Integrate accepted work into the production branch before publishing. Deploying
an isolated worktree replaces the whole site; it does not append that worktree's
pages to production. Do not restore an old Fitness-only deployment over Dashboard.

`npm run prebuild` checks that every personal endpoint is included. After a
release, run `node scripts/check-personal-endpoints.mjs https://singleton-systems.com`
and inspect all three pages in the browser. The readback sends no cookies and
performs no writes.
