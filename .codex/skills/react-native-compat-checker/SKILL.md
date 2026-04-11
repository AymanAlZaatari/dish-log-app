---
name: react-native-compat-checker
description: Flag web-only assumptions that would make a future move from React web to React Native or Expo harder.
---

# Purpose

Use this skill when reviewing architecture, shared logic, or component design for future portability.

# Instructions

1. Identify browser-only APIs in app logic, not just UI code.
2. Flag direct DOM access, window or document dependencies, and CSS assumptions.
3. Prefer extracting reusable business logic into hooks, services, or utility modules.
4. Keep routing, auth, and data logic as framework-agnostic as practical.
5. For Firebase usage, note what can stay shared and what would need platform-specific wrappers.
6. Do not rewrite the app into React Native patterns unless explicitly requested.

# Output expectations

- List the top blockers for future React Native migration.
- Separate easy fixes from later migration-only work.
- Mention whether the current structure is still portable enough.
