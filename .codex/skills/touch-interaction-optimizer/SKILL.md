---
name: touch-interaction-optimizer
description: Improve React interactions for touch devices by favoring tap-friendly controls and mobile-safe states.
---

# Purpose

Use this skill when a feature includes buttons, menus, tabs, dropdowns, carousels, dialogs, or gestures that will be used mostly on phones.

# Instructions

1. Remove reliance on hover-only interactions.
2. Increase tap target size where controls are small or tightly packed.
3. Check for accidental double-tap, scroll-jank, and blocked gestures.
4. Preserve semantic buttons and links.
5. Keep focus states available for keyboard users even when optimizing for touch.
6. Avoid gesture-heavy changes unless the app already uses them.
7. For tabbed interfaces, ensure active state is obvious and easy to switch with one thumb.

# Output expectations

- State which interactions were made touch-safe.
- Mention any controls that may still need manual device testing.
