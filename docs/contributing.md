# Contributing

## Branching

- Use feature branches from `main`.
- Keep PRs focused and reviewable.

## Code Standards

- TypeScript strict mode preferred.
- Validate all external input at boundaries.
- Keep auth and authorization checks explicit.
- Avoid leaking private moderation fields in public queries.

## Pull Request Requirements

- Clear problem statement and approach
- Linked issue/task if available
- Test notes (what was validated)
- Screenshots for UI changes

## Testing Expectations

Before merge, run:

```bash
pnpm lint
pnpm typecheck
pnpm test
```

If test suite is not yet present, include manual verification steps in PR description.

## Sensitive Changes

For changes to moderation logic, auth, or privacy controls:
- Require at least one security-aware reviewer.
- Document behavior changes in relevant docs under `docs/`.
