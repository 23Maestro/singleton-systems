# Client Video Packet Reference

Use this reference when the edit needs more structure than the short skill checklist.

## Asset intake

| Asset | Source | Eagle folder | Premiere bin | Status | Note |
| --- | --- | --- | --- | --- | --- |
| source video | client/local | `01 Source` | `01 Footage` | pending | gray variants; verify final tree path |
| source dialogue | client/local | `01 Source` | `02 Audio` | pending | green variants; verify final tree path |
| overlay/MOGRT/end card | Eagle/shared | `04 Motion Assets` | `03 Graphics` | pending | blue overlay; red titles; verify final tree path |
| music/SFX | Eagle/shared | `04 Motion Assets` | `04 Music` | pending | dark purple; verify final tree path |
| player/coach stills | sourced/client | `04 Motion Assets` | `05 Stills` | pending | orange variants; verify final tree path |
| motion render | Figma/engine | `04 Motion Assets` | `06 Motion Renders` | pending | pink; verify final tree path |
| review export | Premiere | `05 Exports Delivery` | `07 Exports` | pending | naming check |

## Decision labels

`KEEP` use as-is · `TRIM` tighten without changing the claim · `SCRAP` remove · `CHECK` compare against source/script · `MOTION` needs a graphic, animation, callout, or sourced visual.

Every storyboard row should contain one meaningful screen change, its
source/search task, and its Premiere bin. Before timeline mutation, inspect
project info, sequences, active sequence, items, and bins read-only; stop if
the bridge is unavailable. After import, reread project items and prove each
asset's exact `treePath`. A reported `binName` is not placement proof.
