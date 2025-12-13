# Flashcards Data & Storage Spec

This reference outlines how the platform persists flashcards, decks, learning paths, users, and assets so downstream agents can reason about migrations or integrations.

## Qdrant Collections
- **Flashcards (`flashcards`)**: Each upsert stores a `Flashcard` payload keyed by UUID string. Embeddings (size 384, cosine distance) derive from the primary question; IDs are normalized when missing or in `{ "uuid": ... }` shape.【F:backend/app/services/qdrant_flashcard_service.py†L34-L95】
- **Decks (`decks`)**: Rebuilt from flashcards with deterministic IDs (UUID or UUIDv5) and coverage/count metadata preserved in payload JSON. Collection uses a 1-dim vector placeholder for cosine distance consistency.【F:backend/app/services/qdrant_deck_service.py†L41-L126】
- **Learning Paths (`learning_paths`)**: Stores serialized `LearningPath` JSON with generated or normalized UUIDs; collection created at startup with 64-dim zeroed vectors to satisfy Qdrant schema.【F:backend/app/services/qdrant_learning_path_service.py†L23-L115】
- **Connection config**: All collections connect via gRPC using `QDRANT_HOST`/`QDRANT_PORT` envs (default `10.0.0.9:6334`) during FastAPI startup.【F:backend/app/main.py†L33-L39】

## File-Backed Data
- **Users**: JSON file at `data/users.json` holds user records. On first run, the service seeds an admin account (`admin` / `admin123`) and persists subsequent changes with SHA-256 password hashes.【F:backend/app/services/user_service.py†L12-L67】
- **Images**: Uploaded assets are written to `backend/app/resources/images/` and served via the `/images` StaticFiles mount for frontend consumption.【F:backend/app/main.py†L45-L48】【F:backend/app/routes.py†L394-L417】
- **Seeds**: Optional JSON seed files (`flashcards.json`, `learning-paths.json`) live under `backend/app/resources/` and can populate Qdrant via dedicated endpoints (`/Flashcards/seed`, `/api/learning-paths/seed`).【F:backend/app/routes.py†L213-L267】

## Operational Notes
- Rebuilding decks happens automatically when flashcards are indexed or deleted, ensuring deck counts stay synchronized with Qdrant payloads.【F:backend/app/services/qdrant_flashcard_service.py†L53-L146】
- Coverage updates write back to the `decks` collection and are typically triggered after LLM-driven scoring runs per deck.【F:backend/app/routes.py†L89-L119】【F:backend/app/services/qdrant_deck_service.py†L112-L118】
- Queries support both vector search (`/Flashcards/query-vector`, `/Flashcards/query-string`) and random sampling (`/Flashcards/random`, `/Flashcards/{deckId}/random`) for study modes; ensure embeddings stay aligned with the configured vector size (384).【F:backend/app/routes.py†L120-L206】【F:backend/app/services/qdrant_flashcard_service.py†L34-L190】
