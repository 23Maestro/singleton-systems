# QB play library

How to name a QB highlight play. Jerami set this pattern on Nov 25, 2026.

## Name formula

`Start + 1 descriptor (if earned) + N Yd + TD`

A pass needs no word; most QB plays are passes. Only a run gets a prefix.

| Slot | Choose | Rule |
|---|---|---|
| Start | `Pocket` · `Rollout L` · `Rollout R` · `QBRun` | Always. A play that breaks down and rolls out is still a Rollout. If he keeps the ball, it is `QBRun`. |
| Descriptor | 1 at most | Only when it is the impressive part. See the lists below. |
| Yards | `35 Yd` | Always. Rounded to 5. This is what makes each name unique. |
| Result | `TD` | Only for touchdowns. |

Examples: **QBRun S.Line 20 Yd TD**, **Rollout L 4th Down 45 Yd TD**,
**Pocket Slant 95 Yd TD**, **Pocket Touch Pass 10 Yd TD**.

## Yards

Always give a number. A guess within 10 yards beats a blank. Count the painted
numbers (every 10 yards) and lines (every 5) from the snap spot to where the
play stops. If he is tackled short of the end zone, the play ends there: count
to that spot. Jerami corrects misses; that is how this improves.

## QB run cheat sheet

Runs are memorable, so they get a descriptor. Pick 1, or none.

| Descriptor | Use when |
|---|---|
| `S.Line` | He runs down the sideline. |
| `Middle` | He runs up the middle, often from the pocket. |
| `Reverse` | He reverses field. |
| `Bad Snap` | He saves a bad snap and runs. |
| `Diving` | He dives in to score. |
| `Trick Play` | The play is a trick play. |

## Pocket or rollout

Look at the frame where the ball leaves his hand. Was he running or planted?
Where was he? Throwing from outside the hash marks is a rollout. Planted
inside the hashes is `Pocket`.

## Left or right

Use his left and right. He is right-handed. Freeze the first frame and find
which side is offense. On a sideline camera, if he rolls toward the camera,
he rolls right. Away from the camera is left.

## Visual cues for reviewers

These help a reviewer read the clip. They never go in a play name.

- **Goal line:** the white line a player must cross to score.
- **Pylons:** the orange markers at the corners of the end zone.
- **Yard markers:** orange sideline markers in 10s: 10, 20, 30, 40, 50, 40,
  30, 20, 10, then **G** at each goal line. Painted field numbers follow the
  same count; lines are every 5 yards.
- **Ref's arms straight up:** a touchdown.
- **Lost camera:** when the camera shakes or loses the runner, keep watching
  to the last frame. He often shows up again (A11 reappears by the bottom left
  scoreboard edge). Judge the play from every frame. 1 moment never decides it.

Later: write these cues as a canonical schema, so reviewers and models see
exactly which visual told them what.

## Pass descriptors

| Descriptor | Use when |
|---|---|
| `S.Line` | The catch is at the sideline. |
| `Corner` | A throw to the corner of the end zone. |
| `Touch Pass` | A soft, placed throw, like a fingertip catch. |
| `Heave` | He throws a long, high ball, often with a defender on him. |
| `Jump Ball` | The receiver goes up for a contested catch. |
| `4th Down` | It is clearly a 4th down play. |
| Route | `Slant`, `Post`, `Seam`, `Go`, `Out`, `Corner`, `Curl` when clearly seen. |

## Defense and special teams

Name the play type first: `INT Return 45 Yd TD`, `Blocked Punt`.

Do not use **Checkdown** for a QB's throw unless it goes to the running back.
A corner touch pass is caught in the end zone, so it has no run after the catch.

## Routes (receiver's path)

The standard route tree numbers them 1 to 9. Odd numbers break outside; even
numbers break inside. Sources: 360Player route tree guide and the NFL training
route tree.

| # | Route | Shape |
|---|---|---|
| 1 | Flat | Short, out to the side |
| 2 | Slant | Quick cut inside at 45 degrees |
| 3 | Comeback | Deep, then back to the sideline |
| 4 | Curl | Deep, then turns back inside |
| 5 | Out | 10 to 15 yards, then 90 degrees outside |
| 6 | Dig | 10 to 15 yards, then 90 degrees inside |
| 7 | Corner | Deep, toward the corner of the end zone |
| 8 | Post | Deep, toward the goal posts |
| 9 | Go | Straight down the field |

Also: **Seam** (straight up the middle, between the hashes) and **Screen**
(a short throw behind the line).

## Field spot

- **Sideline:** at the out-of-bounds line. Only use it if the catch is within
  a few yards of it.
- **Hashes or Midfield:** between the 2 rows of hash marks.
- **Redzone:** inside the 20.
- **Corner:** the corner of the end zone.

## Result

TD, 4th Down Conversion, First Down, Long Gain. A run past the pylon is a TD,
not "to the 5."

## Checked examples (Armand, Nov 25)

| Clip | Wrong first name | Final name |
|---|---|---|
| A09 | Long gain to TD | QBRun 80 Yd TD |
| A01 | Pocket pass | QBRun 20 Yd TD |
| A11 | Pocket pass into red zone | QBRun S.Line 20 Yd TD |
| A27 | Catch and run to the corner | QBRun S.Line 35 Yd TD |
| A13 | Long QB keeper | QBRun Middle 35 Yd TD |
| A46 | Long run to the 5 | QBRun 35 Yd TD |
| A04 | Night shotgun pass | Rollout R Heave 30 Yd (tackled; not a TD) |
| A41 | Deep shot to end zone | Pocket Post 30 Yd TD |
| A30 | Corner end zone throw | Pocket Touch Pass 10 Yd TD |
| A36 | Rollout end zone throw | Rollout R 10 Yd TD (not a checkdown) |
| A06 | Pass, run to the sideline | Not a pass. Deleted. |
| A32 | Quick pass long run | Deleted: throws behind the receiver. |

Blind yardage test (Nov 25): 5 of 6 guesses landed within 10 yards of Jerami's
numbers. The miss was run versus pass: 3 QB runs were called passes.

## Round 2 checks (Armand, Nov 25)

| Clip | Reviewer name | Final name |
|---|---|---|
| A08 | Rollout R 4th Down 50 Yd TD | Rollout R Heave 50 Yd TD |
| A26 | Pocket 20 Yd TD | Rollout L 20 Yd TD |
| A28 | Pocket S.Line 45 Yd TD | Rollout R S.Line 45 Yd TD |
| A31 | QBRun S.Line 35 Yd | Rollout R S.Line 35 Yd |
| A16 | Pocket 20 Yd TD | QBRun Diving 20 Yd TD |
| A25 | Pocket 4th Down 45 Yd TD | QBRun Trick Play 45 Yd TD |
| A34 | Pocket S.Line 55 Yd TD | QBRun S.Line 55 Yd TD |
| A23 | Same play as A26 | Different game. Pocket Post 15 Yd TD |
| A45 | Not a QB play (punt) | Blocked Punt |
| A49 | Not a QB play | INT Return 45 Yd TD |
| A21 | QBRun S.Line 10 Yd | Rollout L 40 Yd |
| A42 | Pocket S.Line 15 Yd | Pocket Post 15 Yd |
| A44 | Pocket 4th Down 15 Yd | Pocket Jump Ball 25 Yd |

The main miss was pocket versus rollout. Use the throw frame and the hash marks.
