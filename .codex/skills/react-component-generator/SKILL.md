---
name: react-component-generator
description: Create or update React components so they match the existing app structure and styling.
---

# Purpose

Use this skill when building a new UI component, page section, form, or small feature in an existing React application.

# Project assumptions

- The project is an existing React application.
- Styling may use CSS modules, plain CSS, Tailwind, or another existing system.
- Components should match current patterns before introducing new abstractions.

# Instructions

1. Inspect nearby components before writing code.
2. Reuse the repo's current patterns for:
   - file naming
   - props style
   - hooks usage
   - state placement
   - styling approach
3. Prefer small components with clear props.
4. Preserve accessibility:
   - label inputs
   - keep buttons semantic
   - use keyboard-friendly interactions
5. Avoid introducing new UI libraries unless already present.
6. When editing, change the smallest number of files necessary.

# Output expectations

- Explain where the component should live.
- Note any new props or dependencies.
- Mention follow-up work if the component needs tests or integration.
