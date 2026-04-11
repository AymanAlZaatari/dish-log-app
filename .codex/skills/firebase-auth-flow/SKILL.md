---
name: firebase-auth-flow
description: Implement or repair Firebase Authentication flows in a React app.
---

# Purpose

Use this skill for login, signup, logout, auth guards, session handling, protected routes, and auth-related bug fixes.

# Project assumptions

- Firebase Authentication is already configured or intended to be configured.
- The React app may use context, hooks, route guards, or page-level checks.
- Environment variables and Firebase app initialization may already exist.

# Instructions

1. Find existing Firebase initialization code before changing auth logic.
2. Reuse existing auth providers, hooks, and context where possible.
3. Keep credentials and config in environment variables.
4. Never hardcode secrets.
5. For auth features, verify:
   - sign in
   - sign out
   - loading state
   - error state
   - protected route behavior
6. For route protection, prefer the app's current routing style.
7. Avoid creating duplicate auth state listeners.
8. When fixing auth bugs, check for:
   - stale subscriptions
   - race conditions during initial load
   - redirect loops
   - missing cleanup

# Safety checks

- Do not weaken auth checks to make the UI appear to work.
- Do not disable errors silently.
- Do not assume Firestore access is valid just because a user is signed in.

# Output expectations

- Summarize the auth flow changed.
- Mention any required env vars.
- Mention whether route guards or auth context were touched.
