---
name: github-to-firebase-hosting
description: Prepare a React project to move from GitHub-based hosting workflows to Firebase Hosting safely.
---

# Purpose

Use this skill when reviewing or preparing deployment changes for Firebase Hosting.

# Project assumptions

- The source code is currently stored on GitHub.
- Hosting may currently use GitHub Pages, another static host, or local-only deployment.
- The team may later adopt Firebase Hosting and optional GitHub Actions deployment.

# Instructions

1. Inspect existing build and deploy scripts before changing anything.
2. Confirm the app output directory used by the current React setup.
3. When preparing for Firebase Hosting, check for:
   - correct build output path
   - SPA rewrite requirements
   - environment variable handling
   - asset path assumptions
   - routing compatibility
4. Keep GitHub repository workflows intact unless explicitly asked to replace them.
5. If creating deployment guidance, separate:
   - app code changes
   - firebase.json changes
   - hosting setup steps
   - CI/CD steps

# Safety checks

- Do not assume Firebase Hosting rewrites are optional for single-page apps.
- Do not hardcode project IDs in reusable examples unless the repo already does.
- Do not remove existing deployment workflows without a migration path.

# Output expectations

- Note current hosting assumptions found in the repo.
- Note what would need to change for Firebase Hosting.
- Flag any route, env, or asset risks.
