# Product Overview

## Vision

Build a public-interest map for Bangladesh where people can report crimes anonymously, and only moderator-verified incidents appear on the public map.

## Problem

- Many incidents are underreported.
- Public data is often delayed or incomplete.
- Anonymous reporting can improve signal, but unverified claims can cause harm.

## Solution

Politikos-Map separates data intake from publication:

1. Citizen submits anonymous report.
2. Moderator reviews report quality and plausibility.
3. Moderator verifies location/category and approves or rejects.
4. Approved report is shown on map with minimal public details.

## Primary Users

- Reporters (anonymous public users in Bangladesh)
- Moderators (trusted reviewers)
- Admins (manage users, policies, and abuse controls)
- Public viewers (consume verified map data)

## Scope (MVP)

- Anonymous report submission form
- Map view of verified incidents
- Moderator dashboard for triage and verification
- Moderator follow-up updates with additional context (including what happened afterwards)
- Ability to mark previously accepted reports as proven fake
- Admin controls for moderator access
- Basic abuse prevention and audit logging

## Non-Goals (MVP)

- Real-time emergency dispatch
- Identity verification of reporters
- Predictive policing or risk scoring
- Full legal case management

## Regional Focus: Bangladesh

- Country-wide map defaults to Bangladesh bounds.
- Administrative references should support:
  - Division
  - District
  - Upazila/Thana (as needed)
- Time format and locale should be configurable for Bangladesh (`Asia/Dhaka`).

## Success Metrics

- Submission-to-moderation time (median)
- Approval rate after moderation
- Rejection reasons distribution
- Number of verified incidents by area/time
- Moderator consistency (agreement rate on sampled reports)
