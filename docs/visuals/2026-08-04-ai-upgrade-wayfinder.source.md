# AI upgrade + Wayfinder Client Canvas proof

## Core idea

AI often gets the first 80% right. Then it starts guessing. Wayfinder makes it stop so the user can lock the goal, scope, and proof. This page is the first Gary-specific Client Canvas proof, not a generic client schema.

## Gary's real bottleneck

Gary is already 70-80% of the way to a good outbound campaign brief. Each brief still takes 15-30 minutes to fix. He runs it through Claude three or four times before it is worth sending. The output changes and old chat memory leaks in.

Build now:

1. Take a company URL and target person.
2. Pull public facts from the website, LinkedIn, and job posts.
3. Lock the facts and open gaps before writing.
4. Generate a specific, useful campaign brief with an internal-install guide and call-to-action.
5. Check the facts, usefulness, and CTA. Gary gives it the final pass before it goes out.

Add HeyReach later. It can watch replies and start the brief builder when someone is interested. Gary checks the brief before it goes out.

## Canvas stories

The initial canvas keeps nine meaningful objects visible and connects the business workflow to the foundation underneath it.

### Workflow — the brief Gary wants to trust

URL + buyer → research and lock facts → campaign-brief skill → checks → Gary review → finished brief

- **URL + buyer** is the confirmed starting input.
- **Research → lock facts** makes confirmed facts, gaps, and guesses legible before writing.
- **Campaign-brief skill** is Gary's existing workflow made repeatable.
- **Checks before the send** covers facts, usefulness, CTA, hooks, and proof checks.
- **Gary review** keeps the final yes with Gary. The finished brief is the output, not an automated send.

### Foundation — the repeatable layer underneath

Claude setup → repo / source of truth → thin skills + deep references → tool harness

- Claude stays useful, but chat memory is not the source of truth.
- The repo holds the inspectable instructions and references.
- The skill stays thin while deep context remains available beside it.
- The harness gives the skill a small, understandable set of tools and gives hooks a place to enforce the checks.

The foundation connects into the campaign-brief skill and the checks. It explains why repeated prompting is unreliable without turning the page into an architecture inventory.

## Interaction contract

- Start in **Guided path** on `URL + buyer`; arrow keys move through the path.
- Workflow, Foundation, and Explore presets change the emphasis without changing the content.
- Click any card for a business-language explanation, owner, proof, and the decision Gary still makes.
- Drag to pan and use `+` / `−` or the wheel to zoom on a large screen.
- `confirmed`, `fuzzy`, `unknown / later`, `proposed`, and `locked` are visible states, not hidden metadata.
- Technical notes are opt-in and secondary.

JointJS owns only the geometry and relationship lines. Cards, typography, state emphasis, explanation, and motion remain custom presentation owned by Singleton Systems.

## The upgrade guide is the pattern

1. Name the request: latest model, GPT-5.6, or another explicit target.
2. Route to the correct guide before changing anything.
3. Prefer the live source; use the bundled fallback only when live retrieval fails.
4. Load only the references the chosen route requires.
5. State which source was used and verify the result.

## Wayfinder adds the lock

1. Map the fuzzy request.
2. Turn unknowns into small decisions.
3. Lock the owner, allowed files, chosen route, and definition of done.
4. Build one small slice.
5. Run the proof checks, review, then take the next slice.

This is why slowing AI down helps. The user makes the calls that are hard to undo. The agent needs a new decision before it can widen the job or touch more of the repo.

## Small shared stack

- **Skill:** the steps for one job you do often.
- **Tool harness:** the few tools that skill can use.
- **Hooks:** checks that stop bad input or bad output.
- **Synced directory:** one folder you both own. Each AI tool reads from it.

## Next useful move

1. Downgrade Claude to $100/month.
2. Put the rest of the budget into OpenAI.
3. Create the co-owned canonical `skills/` + `plugins/` directory.
4. Build Gary's campaign-brief skill. Run it through the harness and hooks before adding more.

## Call close

The offer is a better way to work with AI. Pick the path, lock the job, run one step, check it, and keep going. Get the brief right before you automate the sender.

## Deliberate boundaries for this proof

- Keep Gary's existing Wayfinder as the content source and first proof.
- Do not replace this with C4.
- Do not generalize `/client/[slug]` yet.
- Do not freeze a reusable Client Canvas schema from this one page.
- Keep HeyReach sender and reply automation as an explicit later / unknown item.

The review question is simple: does the client now understand what fails, why prompts drift, what infrastructure fixes reliability, where his workflow becomes a skill, and where Gary still makes the important decisions?
