---
status: accepted
---

# Blender for new lane masters

New lit 3D graphics for LineUps get built as Blender lane masters, not Unreal
templates. Blender renders headless from a script on this Mac, takes scene
rows from the command line, and writes ProRes 4444 with alpha straight to
Premiere. Unreal needed a heavier automation path on macOS for the same
result. The approved Unreal comparison template stays in production as it is
and gets no new families. A Lane 4 bake-off against it confirms or reverses
this decision.

Update, November 10, 2026: ADR 0004 retires Unreal for new builds. The
Unreal comparison template is history and no longer stays in production.
