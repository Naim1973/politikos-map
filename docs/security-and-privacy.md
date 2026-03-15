# Security and Privacy

## Threat Model (MVP)

Main risks:
- Spam and coordinated false reporting
- Doxxing or personal data leaks
- Unauthorized dashboard access
- Moderator misuse or compromised accounts

## Privacy Principles

- Default to anonymous reporting.
- Do not collect direct personal identity unless required.
- Separate internal moderation data from public output.
- Redact or block personal identifiers from published incident summaries.

## Access Control

- Use `better-auth` for moderator/admin authentication.
- Enforce role-based checks in every protected function:
  - `MODERATOR`: review reports and manage incidents
  - `ADMIN`: manage users, policies, sensitive controls

## Abuse Prevention

- IP/device fingerprint hashing (not raw storage where avoidable)
- Rate limiting by network/device buckets
- Basic content filtering and link/keyword checks
- Duplicate detection by time + geospatial similarity

## Data Protection

- Encrypt secrets and session keys via env management
- TLS everywhere in production
- Least-privilege access for deployment credentials
- Backups and restore drills for Convex data

## Auditing

- Log all moderation and admin actions with actor/timestamp/reason.
- Keep immutable logs for critical actions.
- Monitor unusual moderator behavior patterns.

## Incident Response (Baseline)

1. Contain: disable affected account/key.
2. Assess: identify impacted records/actions.
3. Mitigate: rollback/takedown invalid incidents.
4. Recover: patch root cause and rotate secrets.
5. Review: document post-incident improvements.
