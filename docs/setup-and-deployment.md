# Setup and Deployment

## Prerequisites

- Node.js 20+
- `pnpm` (or npm/yarn, but standardize one package manager)
- Convex account/project
- Environment values for auth and app URLs

## Environment Variables (Draft)

Create `.env.local` for development and configure production equivalents.

Expected keys:
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_CONVEX_URL`
- `CONVEX_DEPLOY_KEY` (server/CI only)
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`

Add additional provider keys if better-auth adapters/social logins are enabled.

## Local Development (Planned)

```bash
pnpm install
pnpm dev
```

If Convex local/dev workflow is required:

```bash
pnpm convex dev
```

## Deployment Flow (Recommended)

1. Push to main branch.
2. CI runs typecheck/lint/tests.
3. Deploy Next.js app.
4. Deploy Convex functions/schema.
5. Run smoke checks:
   - public map loads
   - anonymous report submit works
   - moderator login + queue view works

## Production Readiness Checklist

- Auth roles enforced in all protected routes/functions
- Rate limits enabled for submission endpoints
- Bangladesh boundary validation enabled
- Audit logging enabled for moderation actions
- Error monitoring and alerting configured
- Backup and rollback procedures tested
