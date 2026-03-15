# Architecture

## High-Level Design

```text
Anonymous User
  -> Next.js Web App (public form/map)
  -> Convex mutations/queries
  -> Convex database

Moderator/Admin
  -> Next.js Dashboard (protected)
  -> better-auth session
  -> Convex moderation functions
  -> Convex database

Optional service layer
  -> Hono API (if custom HTTP services/webhooks are needed)
```

## Core Components

- `Next.js`:
  - Public map and report pages
  - Moderator/admin dashboard pages
  - UI rendering and route organization
- `Convex`:
  - Persistent data for reports/moderation/audit
  - Query and mutation functions
  - Realtime updates for dashboards
- `better-auth`:
  - Moderator/admin sign-in and sessions
  - Role-based access checks
- `Hono` (optional):
  - Custom lightweight HTTP endpoints
  - Integrations and webhooks when not ideal inside app routes

## Trust Boundaries

- Anonymous reporters are untrusted input.
- Moderators are trusted-but-audited users.
- Public map exposes only approved and sanitized data.
- Internal notes and moderation metadata stay private.

## Suggested Module Layout

```text
app/
  (public)/
    map/
    report/
  (admin)/
    moderation/
    incidents/
    users/

convex/
  schema.ts
  reports.ts
  incidents.ts
  moderation.ts
  audit.ts

lib/
  auth/
  validation/
  geo/
  rate-limit/

docs/
```

## Data Lifecycle

1. Report created as `PENDING`.
2. Moderator reviews and sets `APPROVED` or `REJECTED`.
3. On approval, a public incident record is created/updated.
4. All moderator actions are stored in audit logs.
