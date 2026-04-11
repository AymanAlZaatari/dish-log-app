---
name: responsive-ui-enforcer
description: Make React views mobile-first, responsive, and safe for small screens without breaking desktop behavior.
---

# Purpose

Use this skill when creating or adjusting layouts, page sections, tabs, cards, lists, forms, and navigation for phone-first access.

# Instructions

1. Start from the smallest viewport first, then scale upward.
2. Prefer fluid layouts over fixed widths and heights.
3. Check for common phone issues:
   - horizontal overflow
   - cramped spacing
   - unreadable text sizes
   - controls too close together
   - sticky headers or footers covering content
4. Preserve the repo's current styling approach.
5. Prefer small CSS changes near the affected component before introducing global layout rules.
6. When multiple tabs or views exist in one page, make sure each tab can scroll independently if needed.
7. Keep safe spacing for mobile browsers with dynamic toolbars.

# Output expectations

- Note what mobile issues were addressed.
- Mention any breakpoints or layout assumptions introduced.
- Flag any desktop behavior that should be manually checked.
