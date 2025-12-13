# User Management Spec

Guidance for authentication, authorization, and profile storage across the Flashcards stack.

## Identity & Storage
- Users are persisted in `data/users.json` with SHA-256 password hashes; missing storage triggers seeding of an `admin` account (`admin` / `admin123`) to ensure initial access.【F:backend/app/services/user_service.py†L12-L67】
- User records include roles (default `user`) and nested `UserSettings` (e.g., `flashcardFontSize`).【F:backend/app/models.py†L104-L140】

## Authentication
- **Login**: `/users/login` validates credentials against stored hashes. On success it issues an HS256 JWT containing user id, username, roles, issuer/audience claims, and an expiry driven by `JWT_EXPIRE_MINUTES` (default 60).【F:backend/app/routes.py†L269-L295】
- **Token handling**: Clients must present the JWT in subsequent API calls (frontend Retrofit/Angular interceptors) to gate admin-only features; the backend currently exposes routes without per-endpoint guards, so client-side role checks are essential.

## User CRUD & Settings
- **List/Create**: `/users` supports listing all users and creating new ones from `AddUserRequest`, hashing the supplied plain password before persistence.【F:backend/app/routes.py†L298-L313】
- **Read/Update/Delete**: `/users/{id}` fetches, updates (ID-mismatch guarded), or deletes a specific user record.【F:backend/app/routes.py†L315-L334】
- **Settings**: `/users/{id}/settings` replaces the `UserSettings` payload for a user after existence validation.【F:backend/app/routes.py†L337-L344】

## Client Responsibilities
- Persist tokens securely (Angular local storage or Android encrypted DataStore) and include them on admin-scope routes (e.g., bulk flashcard operations, coverage refresh).
- Enforce role-aware UI controls (e.g., only admins can reach deck rebuild or bulk import/export flows) until backend authorization middleware is introduced.
