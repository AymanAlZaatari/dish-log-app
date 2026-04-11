---
name: pwa-setup
description: Prepare a React app to behave like an installable progressive web app without disrupting the current deployment flow.
---

# Purpose

Use this skill when adding or reviewing PWA behavior such as installability, manifest setup, icons, service worker registration, and offline shell support.

# Instructions

1. Detect whether the app uses Vite, CRA, Next.js static export, or a custom build before adding PWA files.
2. Reuse existing public assets where possible.
3. Keep PWA setup incremental:
   - manifest
   - icons
   - service worker strategy
   - install prompts only if needed
4. Avoid aggressive caching of dynamic Firebase data by default.
5. Make sure service worker behavior will not trap users on stale versions.
6. For single-page apps, keep route handling compatible with both PWA usage and future Firebase Hosting rewrites.

# Safety checks

- Do not cache authenticated API or Firebase responses blindly.
- Do not enable offline behavior that can mislead users about data freshness.

# Output expectations

- Note which PWA pieces were added or reviewed.
- Mention any stale-cache or deployment risks.
