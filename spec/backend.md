# Backend Reference (FastAPI)

This guide summarizes the FastAPI backend for LLM agents. It focuses on service responsibilities, routing, storage, and LLM usage so assistants can reason about behaviors without re-reading the codebase.

## Application Composition
- `app/main.py` wires the FastAPI instance, enables permissive CORS, loads environment variables from `.env.dev` or `.env.production`, and constructs long-lived services for decks, flashcards, learning paths, and users. It also serves uploaded images from `app/resources/images`.【F:backend/app/main.py†L1-L40】
- Qdrant host/port default to `10.0.0.9:6334`; logging writes to `backend/logging/backend.log` created on startup.【F:backend/app/main.py†L13-L38】

## Domain Services
- **QdrantFlashcardService** ensures the `flashcards` collection exists with cosine distance and embeds primary questions (falling back to a zero vector) before upserting points. It normalizes IDs to UUID strings, keeps deck indexes fresh, and exposes CRUD/scroll helpers such as `get_all`, `get_random`, `query_by_vector`, and `cleanup_image_fields` (see implementation for additional utilities).【F:backend/app/services/qdrant_flashcard_service.py†L1-L107】
- **Deck + Learning Path services** mirror the flashcard service pattern to store deck metadata and learning path definitions in Qdrant. Deck coverage can be updated programmatically (see `/decks/{deck_id}/coverage`).【F:backend/app/routes.py†L117-L156】
- **UserService** (in-memory) supports credential validation, hashing, role assignment, and settings persistence used by auth routes. JWT signing keys, issuer, audience, and expiry are read from environment variables before issuing tokens.【F:backend/app/routes.py†L170-L220】
- **LLMService** exposes async `transform_question` and `ask` methods plus sync `coverage` calculations. Providers are selected by `LLM_PROVIDER` (`openai` default, `deepseek` alternative). Prompts are configurable via `LLM_SYSTEM_PROMPT` and `QUESTION_TRANSFORM_PROMPT`. Responses are parsed from JSON, with graceful fallback to raw content on parse errors.【F:backend/app/services/llm_service.py†L12-L187】

## API Surface
Routes live in `app/routes.py` and are registered under the root router. Key families include:

- **Flashcards**
  - `POST /flashcards` (alias `/Flashcards`): create and index flashcards.
  - `GET /flashcards`: list all flashcards.
  - `PUT /flashcards/{id}` / `PATCH /flashcards/{id}/score` / `DELETE /flashcards/{id}`: update, score, or remove flashcards.
  - `GET /flashcards/random` and `GET /flashcards/{deckId}/random`: sample cards globally or by deck.
  - `POST /flashcards/query-vector` and `POST /flashcards/query-string`: vector and semantic searches that return cards (and optional similarity scores).【F:backend/app/routes.py†L39-L111】【F:backend/app/routes.py†L129-L155】

- **Decks & Coverage**
  - `GET /decks`: list decks, refreshing coverage cache daily by rebuilding from flashcards when needed.
  - `POST /decks/{deck_id}/coverage`: recompute LLM-based coverage for the given deck’s questions.
  - `PUT /decks/{deck_id}`: rename decks and update descriptions while rebuilding indexes.【F:backend/app/routes.py†L101-L156】

- **Learning Paths**
  - CRUD endpoints under `/api/learning-paths` plus a seeding endpoint for bundled JSON data.【F:backend/app/routes.py†L157-L199】

- **Auth & Users**
  - `POST /users/login`: validate credentials and issue JWTs signed with the configured key, issuer, audience, and expiry.
  - Standard CRUD for users at `/users` plus `/users/{id}/settings` for updating preferences. Adding users hashes the provided password before persistence.【F:backend/app/routes.py†L170-L232】

- **AI Generation & Bulk Ops**
  - `POST /api/generate/flashcards`: transform a prompt, request answer/explanation JSON from the LLM, and return a `Flashcard` payload with the transformed question in `question` and `questions`.
  - Bulk import/export endpoints under `/FlashcardBulkImport/upload-json` and `/FlashcardBulkExport/export-json` support deduplication by normalized question text when importing.【F:backend/app/routes.py†L234-L279】

## Data Shape Considerations
- Pydantic models define aliases for camelCase compatibility. The backend normalizes IDs that may arrive as `{"uuid": "..."}` or JSON strings to plain UUIDs before writing to Qdrant or validating route path parameters.【F:backend/app/models.py†L13-L62】【F:backend/app/services/qdrant_flashcard_service.py†L75-L105】
- Deck cache rebuilds rely on `main.deck_service.rebuild_from_flashcards` to synchronize derived deck metadata after flashcard mutations. For consistent coverage metrics, trigger `PUT /decks/{deck_id}` or `POST /decks/{deck_id}/coverage` following bulk updates.【F:backend/app/routes.py†L101-L156】

