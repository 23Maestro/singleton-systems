# Lane 3 Prime beat sheet

Ticket: 23M-392. Source: Jerami's phone recording of the Prime TNF Rodgers and McCarthy package. It is one continuous 23.17 s shot at 59.94 fps with no cuts. Times are in seconds from the start of the recording. The recording starts after the first title already sits on screen.

## How the package works

Each moment is a **station**. A station is a group of cards and type standing on the stadium turf. The camera visits one station, holds, then travels to the next. Old stations stay in the world. They stay visible in the depth, smaller and darker.

Every station runs the same steps:

1. A team-color frame line draws in as a goal-post shape. It opens into the photo card.
2. Side cards slide out from behind the main card.
3. Type builds in. The letters fly in scattered and settle into words in 0.5 to 0.85 s per line.
4. The scene holds for 3 to 6 s. The camera drifts slowly and the photo inside the card zooms slowly.
5. The camera travels to the next station in about 1 s, with motion blur and a burst of light rays.

## Station 1: REUNITED (0.00 to 7.60)

| Time | Beat |
| --- | --- |
| 0.00 | REUNITED is already on. The name line's letters assemble. |
| 0.25 | The gold frame line draws as a goal-post shape. |
| 0.50 | The frame opens into the center photo card, a playing video. |
| 0.75–1.25 | Gold bars extend left and right. Two side cards reveal from behind the center card. |
| 1.75–2.60 | 13 SEASONS / TOGETHER / logo 2006-18 flies in letter by letter. |
| 3.00–3.90 | SUPER BOWL XLV / CHAMPIONS flies in the same way. The center video changes shot. |
| 3.90–6.60 | Hold with a slow camera drift. |
| 6.60–7.60 | The camera travels right and back. The station slides left and recedes, with blur and rays. |

## Station 2: THIS OFFSEASON (7.60 to 14.60)

| Time | Beat |
| --- | --- |
| 7.50–7.75 | The goal-post frame line draws, wide. |
| 8.00 | The large photo card is open. Station 1 sits small at the left, in depth. |
| 7.75–8.25 | The quote flies in as two lines. The yellow attribution lands at 8.25. |
| 8.25–13.50 | Hold. The camera pushes in slowly and the photo zooms slowly. |
| 13.50–14.60 | The camera travels left. The station recedes right. Light rays flare to near white at 14.0–14.5. |

## Station 3: WEEK 3 WIN (14.60 to 23.17)

| Time | Beat |
| --- | --- |
| 14.75 | A large portrait card swings in from the left, close to camera and tilted about 15 degrees. It is overexposed and settles by 15.25. |
| 14.75–15.25 | WEEK 3 WIN and the first quote line fly in. |
| 16.00–16.75 | The second quote line flies in. The attribution lands at 16.75. |
| 17.00–22.90 | Hold. Station 2 shows at the right edge, in depth. |
| 23.00 | A gold light streak starts the exit. |

## Look

- **Reference set:** the recording shows a dark stadium with haze, light rays
  from the upper left and a lit pool on the turf. New Lineups builds use the
  selected team's [canonical stadium photo](../lineups-team-stadiums.md).
  Keep the approved motion and lighting treatment.
- **Type:** heavy condensed sans, extruded in 3D with a bevel. Team color on the first line, white below. The type stands in front of the turf and **casts dark shadows on it**.
- **Cards:** a photo inside a thick glowing team-color frame, with bloom and an inner bevel. Side cards sit slightly behind the main card.
- **Color:** one team color (Steelers gold here) drives frames, first lines and light. LineUps uses each player's team color.

## Lawrence v3 against Prime

Lawrence v3 has the right skeleton: three stations, a camera travel between them, and the old station left in view. It misses the look.

| Element | Lawrence v3 | Prime | Fix in Blender |
| --- | --- | --- | --- |
| Set | A flat DepthFlow photo. No haze, rays or light pool. | A lit stadium with haze and rays. | 23M-393 stadium set |
| Shadows | None. Cards and type float. | Type and cards shadow the turf. | Real turf in 23M-393 |
| Numbers | Flat 2D text. Labels are tiny. | Big extruded type. | 23M-394 number kit |
| Card frame | A thin gold line. No glow. | A thick glowing frame with bloom. | 23M-395 |
| Build-in | A 0.48 s fade per stat. | Letters fly in and settle. | 23M-395 |
| Travel | A slide with no blur or light burst. The old station is a tiny thumbnail. | A 1 s travel with blur and a ray burst. The old station stays readable in depth. | 23M-396 |
| Hold | Still. | A slow drift and a slow photo zoom. | 23M-395 |

Keep from Lawrence: one card on the left, which leaves room for Mark's camera on the right; Mark's cue timing; the copy.

Frame sheets: `/Volumes/HomeSSD/Generated/CATENA_MEDIA_LINEUPS/references/2026-11-09-prime-breakdown/`.
