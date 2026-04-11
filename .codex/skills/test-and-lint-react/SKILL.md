---
name: test-and-lint-react
description: Validate React and Firebase-related changes with linting and focused tests.
---

# Purpose

Use this skill after feature work, bug fixes, and refactors.

# Instructions

1. Detect the package manager and project scripts before running commands.
2. Prefer the repo's existing scripts.
3. At minimum, attempt relevant validation such as:
   - lint
   - unit tests
   - build
4. If no tests exist for changed behavior, suggest the smallest valuable test.
5. For UI changes, verify important states:
   - loading
   - empty
   - error
   - success
6. For Firebase-related changes, verify assumptions through code paths even if full integration tests are not present.

# Output expectations

- Report what commands were run.
- Report what passed, failed, or could not be executed.
- Mention any missing test coverage worth adding next.
