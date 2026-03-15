# Moderation Workflow

## Purpose

Ensure only reliable and safe incident data appears publicly, while protecting anonymous reporters.

## Workflow States

1. `PENDING`: newly submitted report.
2. `NEEDS_INFO`: insufficient detail or unclear location/type.
3. `APPROVED`: verified for publication.
4. `REJECTED`: false, duplicate, abusive, or too low confidence.
5. `PROVEN_FAKE`: previously accepted report later confirmed fake.

## Review Checklist

Moderators should verify:
- Crime category is plausible and mapped correctly.
- Location is valid and within Bangladesh.
- Description is not obviously abusive/spam/fabricated.
- Submission is not a duplicate of an existing report/incident.
- Public summary can be published safely (no personal identifiers).

## Decision Outputs

On `APPROVED`:
- Create or update `incidents` record.
- Store moderation reason and reviewer metadata.
- Log action in `auditLogs`.

On `REJECTED`:
- Save standardized rejection reason code.
- Keep report for internal history.
- Log action in `auditLogs`.

On follow-up update (independent action):
- Moderator can append timeline notes to the report/incident at any point in lifecycle.
- Follow-ups can include additional details, aftermath updates, corrections, or investigation progress.
- Choose whether each follow-up is public-facing or internal-only.
- Log action in `auditLogs`.

On `PROVEN_FAKE` after prior acceptance:
- Mark report status as `PROVEN_FAKE`.
- Retract or hide the public incident (`verificationStatus=RETRACTED_FAKE` or `visibility=HIDDEN`).
- Preserve previous state for traceability.
- Log action in `auditLogs` with reason and actor.

## Example Reason Codes

- `DUPLICATE_REPORT`
- `INSUFFICIENT_EVIDENCE`
- `INVALID_LOCATION`
- `OUTSIDE_BANGLADESH`
- `ABUSIVE_CONTENT`
- `NOT_A_CRIME_EVENT`
- `PROVEN_FAKE_AFTER_REVIEW`

## Operational Guardrails

- Two-person review for high-impact incidents (optional policy).
- Periodic random sampling of approvals for quality checks.
- Escalation path for legal/safety-sensitive reports.
- Moderator action metrics and anomaly monitoring.
