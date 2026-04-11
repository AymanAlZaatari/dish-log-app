---
name: bug-fix-react-firebase
description: Diagnose and fix common React and Firebase problems with minimal regression risk.
---

# Purpose

Use this skill when the app has a runtime error, rendering issue, auth issue, missing data, stale state, broken Firebase configuration, or deployment regression.

# Debugging flow

1. Reproduce the issue from the user's report.
2. Classify the issue:
   - rendering
   - state management
   - routing
   - auth
   - Firebase initialization
   - Firestore/database access
   - environment/config
   - hosting/deployment
3. Find the smallest root-cause fix.
4. Keep the patch narrow.
5. Add a guard, test, or fallback when it meaningfully reduces recurrence.

# Common checks

- incorrect import or export
- duplicate Firebase app initialization
- missing env vars
- auth listener timing issues
- route guard redirect loop
- undefined data during initial render
- Firestore path typo or permission mismatch
- async state update after unmount
- broken build script or hosting config

# Output expectations

- State the root cause clearly.
- State why the chosen fix is safer than broader changes.
- Mention any remaining uncertainty.
