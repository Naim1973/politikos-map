# Data Model

## Design Principles

- Store anonymous reports separately from public incidents.
- Keep moderation metadata private.
- Preserve immutable audit history for sensitive actions.
- Minimize personally identifying data collection.

## Main Entities

## `reports` (anonymous submissions)

Purpose: raw user-submitted input awaiting moderation.

Suggested fields:
- `_id`
- `status`: `PENDING | APPROVED | REJECTED | NEEDS_INFO | PROVEN_FAKE`
- `crimeType`: string enum (theft, assault, harassment, etc.)
- `description`: string
- `incidentTime`: timestamp (reported occurrence time)
- `submittedAt`: timestamp
- `location`:
  - `lat`: number
  - `lng`: number
  - `accuracyMeters`: number | null
  - `addressText`: string | null
  - `division`: string | null
  - `district`: string | null
  - `upazilaOrThana`: string | null
- `attachments`: array (optional)
- `sourceMeta`:
  - `ipHash`: string | null
  - `userAgentHash`: string | null
  - `rateLimitBucket`: string | null
- `moderation`:
  - `reviewedBy`: moderator id | null
  - `reviewedAt`: timestamp | null
  - `reasonCode`: string | null
  - `internalNotes`: string | null
  - `followUps`: array of:
    - `addedBy`: moderator id
    - `addedAt`: timestamp
    - `note`: string
    - `isPublic`: boolean
    - `category`: `AFTERMATH | CORRECTION | INVESTIGATION_UPDATE | OTHER`
  - `provenFakeBy`: moderator id | null
  - `provenFakeAt`: timestamp | null
  - `provenFakeReason`: string | null

## `incidents` (public verified map records)

Purpose: sanitized, approved incidents shown on map.

Suggested fields:
- `_id`
- `reportId` (source report reference)
- `crimeType`
- `summary` (safe public text)
- `incidentTime`
- `publishedAt`
- `location`:
  - `lat`
  - `lng`
  - `precision`: `EXACT | APPROXIMATE`
  - `division`
  - `district`
  - `upazilaOrThana`
- `severity`: optional enum
- `visibility`: `PUBLIC | HIDDEN` (for rollback/takedown)
- `verificationStatus`: `VERIFIED | UNDER_REVIEW | RETRACTED_FAKE`
- `followUps`: array of public-safe updates:
  - `addedAt`
  - `note`
  - `category`

## `users` (authenticated staff only)

Purpose: moderator/admin accounts.

Suggested fields:
- `_id`
- `email`
- `name`
- `role`: `MODERATOR | ADMIN`
- `status`: `ACTIVE | SUSPENDED`
- `createdAt`
- `lastLoginAt`

## `auditLogs`

Purpose: accountability for moderation and admin actions.

Suggested fields:
- `_id`
- `actorUserId`
- `actionType` (`REPORT_APPROVED`, `REPORT_REJECTED`, etc.)
- `targetType` (`REPORT`, `INCIDENT`, `USER`)
- `targetId`
- `before`: object | null
- `after`: object | null
- `reason`
- `createdAt`

## Indexing Recommendations

- `reports` by `status`, `submittedAt`
- `reports` by `moderation.provenFakeAt`
- `reports` by location geohash/grid key if used
- `incidents` by `publishedAt`
- `incidents` by `verificationStatus`
- `incidents` by location geohash/grid key
- `auditLogs` by `actorUserId`, `createdAt`

## Retention Notes

- Keep raw reports and audit logs long enough for accountability and abuse investigations.
- Define a formal retention policy before production launch.
