# Flashcards App – System Overview

This document summarizes the Flashcards AI Learning App for downstream LLM agents. It highlights the high-level purpose, platform layout, and primary data structures so the rest of the spec set can be navigated quickly.

## Product Goals
- Provide an AI-assisted flashcard learning platform with deck-based study, admin tools, and learning paths. The stack pairs an Angular PWA frontend with a FastAPI backend, Qdrant vector storage, and LLM-powered generation and coverage estimation.【F:README.md†L1-L76】【F:README.md†L96-L124】

## Top-Level Architecture
- **Frontend (Angular 17)** lives in `frontend/flashcards-ui` and exposes study, admin, image management, authentication, and learning-path views. Routes map directly to components such as `HomeComponent`, `FlashcardComponent`, `FlashcardAdminComponent`, and `LearningPathComponent`. Admin-only screens use `AdminGuard`.【F:frontend/flashcards-ui/src/app/app.routes.ts†L1-L24】
- **Backend (FastAPI)** initializes Qdrant-backed services for flashcards, decks, and learning paths, plus an in-memory user service. CORS is open for all origins to support local development and mobile access.【F:backend/app/main.py†L1-L39】
- **Vector store (Qdrant)** holds flashcards with embeddings generated via the backend embedding service. The FastAPI layer ensures the collection exists and keeps deck metadata in sync after writes.【F:backend/app/services/qdrant_flashcard_service.py†L1-L75】【F:backend/app/services/qdrant_flashcard_service.py†L90-L106】
- **LLM integrations** power question transformation, flashcard generation, and deck coverage scoring. Providers are selected by `LLM_PROVIDER`, supporting OpenAI or DeepSeek with configurable prompts.【F:backend/app/services/llm_service.py†L12-L92】【F:backend/app/services/llm_service.py†L118-L187】

## Core Data Model
- **Flashcard** objects carry IDs (normalized to UUID strings), primary and alternate questions, answer, explanation, optional images, topic, score, and deck association. Aliases (e.g., `deckId`, `questionImage`) support client compatibility. Validation syncs `question` and `questions` fields when one is missing.【F:backend/app/models.py†L13-L62】
- **Deck** summarizes grouped flashcards with a description and coverage metric; **LearningPath** links card IDs and topics for guided study flows.【F:backend/app/models.py†L64-L102】
- **User/UserSettings** provide auth metadata and preferences such as flashcard font size. `AddUserRequest` allows plain password creation for seeding/admin flows.【F:backend/app/models.py†L104-L140】

## Key User Journeys
- **Study:** Learners browse decks and pull random cards per deck. Backend routes expose `/flashcards/{deckId}/random` and `/flashcards/random` for general practice.【F:backend/app/routes.py†L60-L99】
- **Manage content:** Admins add, update, delete, bulk import/export flashcards, normalize images, and rebuild decks. Coverage refresh uses LLM-based scoring per deck.【F:backend/app/routes.py†L17-L188】【F:backend/app/routes.py†L201-L250】
- **Generate with AI:** Users submit a question; the backend transforms it and calls the configured LLM to return answer/explanation JSON, packaged as a new `Flashcard` response.【F:backend/app/routes.py†L252-L268】【F:backend/app/services/llm_service.py†L12-L92】

## Environment Expectations
- Frontend assumes the API base URL matches the current host on port `5000`, enabling LAN access when serving locally (`ng serve --host 0.0.0.0`).【F:frontend/flashcards-ui/src/environments/environment.ts†L1-L11】
- Backend defaults to `QDRANT_HOST=10.0.0.9`, `QDRANT_PORT=6334`, and JWT/LLM secrets loaded from `.env.dev` or `.env.production` depending on `ENV`. Logs write to `backend/logging/backend.log`.【F:backend/app/main.py†L1-L38】

