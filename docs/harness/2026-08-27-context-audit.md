# Context audit — 2026-08-27

## measured facts

Root `AGENTS.md` is 1,619 bytes. The required startup set named by repository guidance is 8,940 bytes: `AGENTS.md`, `CODEX.md`, `CONTEXT.md`, and the three files under `docs/agents/`.

The selected Lineups package is 26,724 bytes across the storyboard skill, Lineups treatment reference, Figma skill, and production reference. The current Lineups routing hook adds 2,278 bytes for a matching prompt. The combined selected package plus hook text is about 29 KB.

The inspected repo, user skill folders, and plugin cache contain 484 `SKILL.md` files. A smaller scan limited to repo and user skill roots found 144 unique files. These counts measure files on disk. They do not prove that every skill description or full skill body enters one request. Current [OpenAI Skills documentation](https://learn.chatgpt.com/docs/build-skills) says skill instructions load after selection.

`~/.codex/memories/raw_memories.md` is 386,264 bytes. The memory SQLite store has 84 generated thread rows, and all 84 are marked for phase two. This does not prove that the raw file or every row enters this session.

The current [OpenAI AGENTS.md documentation](https://learn.chatgpt.com/docs/agent-configuration/agents-md) supports directory-scoped instruction files. The current [OpenAI Hooks documentation](https://learn.chatgpt.com/docs/hooks) says matching hooks from every active source run and large hook output can be capped.

## recommendation for Jerami

- Keep root `AGENTS.md` small.
- Move task judgment into selected skills and short references.
- Reduce the Lineups prompt hook to route, contract pointers, review gate, and verification command after this proof settles.
- Add nested `AGENTS.md` only where directory scope removes repeated startup text.
- Audit the 484 skill files by source and duplicate name before disabling any entry.
- Audit the 84 memory rows by age, reuse count, and overlap before deleting any memory.
- Measure one fresh Lineups session transcript to separate discovered descriptions from selected skill bodies and hook text.

No instruction, skill, or memory was deleted or disabled in this task. Pruning waits for Jerami’s review.
