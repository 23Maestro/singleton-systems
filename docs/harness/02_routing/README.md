# 02 Routing

Owner: Cerebral router.

Allowed inputs:

```text
intake note
raw user request
Opportunity HQ candidate
command idea
portfolio/workflow/offer/job lead
```

Allowed outputs:

```text
[lane] Cash Jobs | Career Jobs | Freelance | Offer | Portfolio
[owner] durable owner
[intent] one plain sentence
[shape] capture | task | sub-task | dependency | portfolio | command idea | operating rule
[tools] skill stack and action surface
[review] review gate
[next] next concrete action
[do-not] blocked surfaces or actions
```

Natural language is the default input. Every enabled route must keep one tested
plain-language example in `config/cerebral-registry.json`. Use an exact route tag
only as an optional override or helper-generated reminder:

```text
[route] freelance-proposal
```

An exact route must resolve to an enabled `route_key`. Unknown or disabled keys
return a route error instead of falling back to a guess.

Helper-generated packets may include:

```text
[route] offer-content
[shape] working-brief
[tools] s-systems:offer-proof-content
[query] Turn this creator reference into a proof-led content angle.
```

The hook treats `[route]` as the authority only when the key is enabled. It then
checks that every requested `[tools]` entry belongs to the selected route. If no
route is supplied, normal natural-language trigger matching remains the default.

Do not:

```text
create new lanes
create folders/tags/commands
mutate Notion
rename surfaces
route around Opportunity HQ for durable task state
```

Next action rule: if it has task weight, send it to `03_task-shape`; if not, keep it in Obsidian or docs.
