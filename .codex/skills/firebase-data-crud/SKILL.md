---
name: firebase-data-crud
description: Add or update Firebase data access for Firestore or Realtime Database in a React app.
---

# Purpose

Use this skill for reads, writes, list rendering, create/update/delete flows, optimistic UI, and data-access bug fixes.

# Project assumptions

- The app uses Firebase for data storage.
- Data access may live in hooks, services, context, or directly inside components.
- The codebase may already define converters, mappers, or collection constants.

# Instructions

1. Identify whether the app uses Firestore or Realtime Database before coding.
2. Reuse existing data-access helpers and collection naming.
3. Keep reads and writes out of presentational components when the repo already separates concerns.
4. Validate assumptions about document shape from existing code.
5. Handle loading, empty, success, and error states.
6. For list views, avoid unnecessary repeated reads.
7. For writes, prefer existing service functions if present.
8. If deletion is destructive, preserve any confirmation UX already used by the app.

# Safety checks

- Do not invent collection paths without checking existing patterns.
- Do not modify security rules as part of normal feature work unless explicitly requested.
- Do not remove error handling to reduce visible failures.

# Output expectations

- Note the collection or path touched.
- Mention whether schema assumptions were made.
- Mention any needed security-rules follow-up.
