# Private sites

When Jerami says a Vercel site has sensitive data or asks to close it off,
use this process. The dashboard is the working reference. This rule applies
to new work or a named change; it does not change access on existing sites.

## Default setup

Keep the site on Vercel. Use Google sign-in through Supabase Auth. Supabase
holds the sign-in account and session. Each phone or computer signs in once
and keeps its own browser cookie. Refresh the session as needed. Do not copy
cookies between devices or put access tokens in shared links.

Choose who may enter before building: 1 owner or a named set of users.
The dashboard currently allows only `jerami@singleton-systems.com`.
New sites must set their own access rule.

## Setup steps

1. Confirm the Vercel project, domain, Supabase project and allowed users.
2. Create a Google web OAuth client. Add the Supabase Auth callback URL.
   Enable Google in Supabase Auth and store the client secret there.
3. Add the site's exact callback URL to the Supabase redirect allow list.
   Keep local, preview and production URLs separate.
4. Store app settings in the correct Vercel environment. Keep provider
   secrets and Supabase service-role keys out of browser code and Git.
5. Add sign-in, callback, sign-out and session-refresh routes. Use the
   current supported Supabase server-side session pattern.
6. Check the user on the server before serving private pages, API data,
   files or writes. Validate the session with Supabase and apply the site's
   access rule. A hidden page, `noindex` tag or client-side redirect is not
   an access check. Use row-level security for browser database access.
7. Deploy through the normal review and release process. Check the actual
   production domain before calling it done.

## Finish checks

- A guest cannot read private data through the page or its API.
- An allowed Google account signs in and loads real data.
- A different account is denied, even if Google sign-in succeeds.
- Reload keeps access. Expired sessions refresh or return to sign-in.
- Sign-out removes access. Private responses cannot enter a shared cache.
- Test on desktop and phone. Report any device still awaiting a check.

## Dashboard reference

- Session and owner check: `lib/dashboard-auth.ts`.
- Session refresh: `proxy.ts`.
- Sign-in, callback and sign-out: `app/auth/dashboard/`.
- Page guard: `app/command-center/page.tsx`, also used by `/dashboard`.
- API guards: `app/api/command-center/`.
- Access tests: `tests/command-center-access.test.mjs`.

Reuse the sequence and checks. Keep each site's credentials, users and
redirect URLs separate. Check current package docs before copying code.
