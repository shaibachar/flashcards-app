# Frontend Reference (Angular)

This document orients LLM agents to the Angular PWA housed in `frontend/flashcards-ui`. It highlights navigation, services, and environment assumptions relevant to coordinating with the backend and vector store.

## Navigation & Routing
- Routes in `app.routes.ts` map core experiences:
  - `/` → `HomeComponent` for deck selection and entry into study mode.
  - `/deck/:deckId` → `FlashcardComponent` for per-deck practice.
  - `/manage-flashcards` → `FlashcardAdminComponent` for CRUD and bulk actions.
  - `/manage-images` → `ImageManagerComponent` for uploaded assets.
  - `/learning-paths` → `LearningPathComponent` for guided sequences.
  - `/bulk-import` → `FlashcardBulkImportComponent` for JSON imports.
  - `/login` and `/admin/users` provide auth and user administration (the latter gated by `AdminGuard`).
  - `/settings` exposes user preferences such as font size; `/about` and `/help` cover reference content.【F:frontend/flashcards-ui/src/app/app.routes.ts†L1-L24】

## API Services
- **FlashcardService** (`services/flashcard.service.ts`)
  - Targets `${apiBaseUrl}/flashcards` for list/create/update/delete plus score updates and random draws per deck.
  - Normalizes IDs that may arrive as objects (e.g., `{uuid: ...}`) or JSON strings before sending mutations to keep backend and Qdrant storage consistent.【F:frontend/flashcards-ui/src/app/services/flashcard.service.ts†L1-L69】
  - Wraps AI generation (`POST /api/generate/flashcards`), database reseeding, and image cleanup helpers for admin workflows.【F:frontend/flashcards-ui/src/app/services/flashcard.service.ts†L70-L86】

- **DeckService** (`services/deck.service.ts`)
  - Reads deck metadata from `${apiBaseUrl}/decks` and triggers coverage recomputation via `POST /decks/{id}/coverage`.
  - Supports deck rename/description updates through `PUT /decks/{id}` used by admin tooling.【F:frontend/flashcards-ui/src/app/services/deck.service.ts†L1-L24】

Additional services (auth guard, user, logger, learning paths) follow similar patterns of lightweight HttpClient wrappers pointing at the FastAPI routes described in `spec/backend.md`.

## Environment & Hosting
- `environment.ts` sets `apiBaseUrl` dynamically based on the browser’s current protocol/hostname with port `5000`, enabling local LAN testing without manual configuration. Logging defaults to `debug` for development builds.【F:frontend/flashcards-ui/src/environments/environment.ts†L1-L11】
- Ensure the backend CORS settings remain permissive (see `spec/backend.md`) when serving the Angular app from `ng serve` or Docker Compose.

