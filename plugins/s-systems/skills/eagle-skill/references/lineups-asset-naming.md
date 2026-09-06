# Lineups Eagle Asset Contract

This is the only naming and tag contract for NFL and CFB people and logos.

## Names

- Person photo: `<person-name>-<next-number>`, for example `mike-tomlin-1`.
- Team logo: `<team-name>-<next-number>`, for example `pittsburgh-steelers-1`.
- Use lowercase letters, numbers, and hyphens only.
- Continue the subject's highest number across the full Eagle library. Do not
  restart numbering per episode or folder.
- Never put league, team, role, photo type, date, game, episode, or folder data
  in a person's name.

## Tags

Person photos have exactly four tags:

1. League: `NFL` or `CFB`
2. Team: the official team name
3. Role: `Player` or `Coach`
4. Photo Type: `Action` or `Transparent`

Logos have exactly three tags: League, Team, and `Logo`. Logos do not have a
Role tag.

Do not create suggested tags or add extra tag groups. An uncertain identity
stops for review. All Lineups name and tag writes run through
`scripts/lineups-asset-gate.mjs`; direct `item_update` calls are outside this
contract.
