# AI upgrade + Wayfinder call map

## Core idea

AI often gets the first 80% right. Then it starts guessing. Wayfinder makes it stop so the user can lock the goal, scope, and proof.

## Gary's real bottleneck

Gary is already 70-80% of the way to a good outbound campaign brief. Each brief still takes 15-30 minutes to fix. He runs it through Claude three or four times before it is worth sending. The output changes and old chat memory leaks in.

Build now:

1. Take a company URL and target person.
2. Pull public facts from the website, LinkedIn, and job posts.
3. Lock the facts and open gaps before writing.
4. Generate a specific, useful campaign brief with an internal-install guide and call-to-action.
5. Check the facts, usefulness, and CTA. Gary gives it the final pass before it goes out.

Add HeyReach later. It can watch replies and start the brief builder when someone is interested. Gary checks the brief before it goes out.

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
5. Run the proof checks, review, then unlock the next slice.

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
