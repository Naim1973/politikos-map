# Politikos-Map

Anonymous, moderator-verified crime reporting map for Bangladesh.

## What This Project Is

Politikos-Map allows people to submit crime reports anonymously.  
Reports are reviewed by moderators before being published on the map at the verified location.

Core goals:
- Protect reporter anonymity.
- Prevent misinformation through moderation.
- Support post-publication corrections (follow-ups and fake-report reclassification).
- Show trusted, location-based crime signals for Bangladesh.

## Tech Stack

- `Next.js` (App Router) for frontend and server actions/routes
- `TypeScript` for end-to-end type safety
- `Convex` for realtime database/functions
- `better-auth` for moderator/admin authentication
- `Hono` (optional) for lightweight API endpoints/services if needed

## Documentation Index

- Product brief: [docs/product-overview.md](docs/product-overview.md)
- System architecture: [docs/architecture.md](docs/architecture.md)
- Data model: [docs/data-model.md](docs/data-model.md)
- Moderation workflow: [docs/moderation-workflow.md](docs/moderation-workflow.md)
- API design: [docs/api-design.md](docs/api-design.md)
- Security and privacy: [docs/security-and-privacy.md](docs/security-and-privacy.md)
- Setup and deployment: [docs/setup-and-deployment.md](docs/setup-and-deployment.md)
- Contributing guide: [docs/contributing.md](docs/contributing.md)

## Quick Start (Planned)

When app scaffolding is added, expected steps are:

```bash
pnpm install
pnpm dev
```

See full environment and deployment notes in [docs/setup-and-deployment.md](docs/setup-and-deployment.md).

## Project Status

Documentation-first stage.  
Implementation can now follow these docs as source of truth.
