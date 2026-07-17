# Cerebral Route Helper

The helper is optional. Natural prompts and the Cerebral hook must work without
Keyboard Maestro.

## Keyboard Maestro

Create one macro with two native actions:

```text
1. Execute Shell Script
   cd /Users/singleton23/Documents/Development/singleton-systems
   node scripts/cerebral-helper.mjs --html

   Save stdout to variable: CerebralHelperHTML

2. Custom HTML Prompt
   %Variable%CerebralHelperHTML%
```

The WebView reads the local canonical registry on each run. It shows one npm-
tested natural phrase per route, accepts a plain request, and copies the composed
prompt. `Add exact route tag` is optional.

When exact mode is on, the helper emits a small packet:

```text
[route] offer-content
[shape] working-brief
[tools] s-systems:offer-proof-content
[query] Turn this creator reference into a proof-led content angle.
```

The hook resolves `[route]` by exact enabled `route_key`, confirms `[tools]`
belongs to that route, and falls back to natural-language matching when no route
is provided. `happy jerami` can stay as friendly button text or closing copy; it
does not carry routing meaning.

## Direct Use

```bash
cd /Users/singleton23/Documents/Development/singleton-systems
node scripts/cerebral-helper.mjs --html > /tmp/cerebral-helper.html
open /tmp/cerebral-helper.html
```

Example natural prompt:

```text
Write an Upwork freelance proposal for this client post.

Intent: Keep it short and use my real course-editing proof.
```

Optional exact override:

```text
[route] freelance-proposal
```

Offer proof content packet:

```text
[route] offer-content
[shape] working-brief
[tools] s-systems:offer-proof-content
[query] Turn this creator reference into a proof-led content angle.
```
