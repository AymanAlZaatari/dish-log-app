---
name: mobile-auth-flow
description: Adapt Firebase authentication flows for smaller screens, mobile browsers, and app-like session behavior.
---

# Purpose

Use this skill when auth UX is used mainly on phones or when the app may later become a PWA or React Native app.

# Instructions

1. Review the current sign-in providers before changing behavior.
2. Prefer auth flows that work reliably on mobile browsers.
3. Watch for popup blockers, redirect loops, and lost loading state.
4. Keep forms compact and thumb-friendly.
5. Preserve clear error feedback and recovery actions.
6. Keep auth persistence aligned with expected mobile usage.
7. For protected tabs or views, avoid flashing private content during auth initialization.

# Output expectations

- State whether the auth flow is mobile-safe.
- Mention any provider-specific risks.
- Mention any loading or redirect behavior that should be tested on device.
