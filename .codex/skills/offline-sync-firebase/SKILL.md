---
name: offline-sync-firebase
description: Add or review Firebase offline behavior for mobile-first reliability while keeping data consistency explicit.
---

# Purpose

Use this skill when improving phone usability for weak connections, temporary offline states, or retry-friendly data interactions.

# Instructions

1. Identify whether the app uses Firestore or Realtime Database.
2. Check whether offline persistence is already enabled.
3. Prefer explicit handling for these states:
   - loading
   - cached data shown
   - write pending
   - sync restored
   - sync failed
4. Keep user messaging honest when data may be stale.
5. Avoid changing security rules as part of offline setup.
6. For destructive actions, consider pending-write visibility before assuming success.

# Output expectations

- State what offline behavior exists now.
- State what was added or what should be added next.
- Mention any consistency or stale-data tradeoffs.
