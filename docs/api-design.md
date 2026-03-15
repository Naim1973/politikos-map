# API Design

## Approach

Primary backend logic should be implemented with Convex functions.  
Use Hono only for cases where an explicit HTTP service is needed (external integrations, webhook ingestion, custom middleware chains).

## Convex Function Groups

## Public (anonymous input)

- `reports.submit`
  - Input: crime type, description, incident time, location
  - Output: report id and acceptance status
  - Controls: validation, rate limiting, abuse filters

- `incidents.listPublic`
  - Input: map bounds, filters (type/date)
  - Output: sanitized approved incidents only

## Moderator/Admin (authenticated)

- `moderation.listQueue`
  - Returns pending/needs-info reports

- `moderation.reviewReport`
  - Input: report id, decision, reason code, notes
  - Output: updated status and optional incident id

- `moderation.addFollowUp`
  - Input: report/incident id, follow-up note, visibility (`PUBLIC | INTERNAL`)
  - Output: appended follow-up entry and updated timestamps
  - Notes: usable regardless of current report status; not tied to fake/not-fake decision

- `moderation.markProvenFake`
  - Input: approved report id, reason code, notes
  - Output: report status `PROVEN_FAKE` and incident retraction/hide result

- `incidents.updateVisibility`
  - Admin/mod only, hide/show published incidents

- `users.manageRole` (admin only)
  - Manage moderator/admin role assignments

## Validation Rules

- Reject invalid coordinates and out-of-range values.
- Enforce location within Bangladesh boundary or fallback rule.
- Normalize crime category to known enum list.
- Cap text length and sanitize unsafe content.

## Error Contract

Standardized error shape:

```ts
type ApiError = {
  code: string;
  message: string;
  requestId?: string;
};
```

Common codes:
- `UNAUTHORIZED`
- `FORBIDDEN`
- `VALIDATION_ERROR`
- `RATE_LIMITED`
- `NOT_FOUND`
- `CONFLICT`
- `INTERNAL_ERROR`

## Optional Hono Endpoints

Use only when needed:
- `POST /webhooks/...` for external provider callbacks
- `GET /health` for service health checks
- `POST /ingest/...` for controlled third-party data feeds
