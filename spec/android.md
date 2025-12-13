# Flashcards Android Frontend Spec

This guide summarizes the native Android client housed in `frontend/flashcards-android/`, focusing on structure, configuration, and how it mirrors the web experience for downstream LLM agents.

## Architecture & Tech Stack
- **Jetpack Compose UI with MVVM/Clean Architecture**: Presentation screens under `presentation/` consume domain `ViewModel`s that delegate to repository and data layers, keeping UI declarative and state-driven.【F:frontend/flashcards-android/README.md†L8-L47】
- **Dependency Injection**: Hilt modules in `di/` wire Retrofit, Room, and DataStore so screens can request typed interfaces without manual wiring.【F:frontend/flashcards-android/README.md†L23-L49】
- **Networking & Local Storage**: Retrofit + OkHttp handle REST calls to the FastAPI backend; Room and DataStore back offline caching and secure preference storage (e.g., JWT token).【F:frontend/flashcards-android/README.md†L10-L16】【F:frontend/flashcards-android/README.md†L55-L80】

## Project Layout
- **Data Layer**: `data/local` (DAOs, entities, database) and `data/remote` (API interfaces, DTOs, interceptors) provide the persistence and network surface; `data/repository` coordinates them.【F:frontend/flashcards-android/README.md†L23-L35】
- **Domain Layer**: `domain/model`, `domain/repository`, and `domain/usecase` capture business logic independently of framework code.【F:frontend/flashcards-android/README.md†L35-L38】
- **Presentation Layer**: Compose screens live under `presentation/` (`auth`, `home`, `decks`, `flashcards`, `study`, `learningpaths`, `settings`) with a central navigation graph in `presentation/navigation`.【F:frontend/flashcards-android/README.md†L39-L49】
- **Build & Config**: Base URL is injected via `build.gradle.kts` (`API_BASE_URL`) with emulator-friendly defaults (`10.0.2.2:5000`).【F:frontend/flashcards-android/README.md†L123-L133】 Configure `local.properties` to match your backend host when running on device.【F:frontend/flashcards-android/README.md†L94-L104】

## Feature Parity Targets
- **Core flows**: Login, deck/flashcard CRUD, study mode with swipe gestures, learning paths, and user settings mirror the Angular UI feature set.【F:frontend/flashcards-android/README.md†L60-L67】
- **Mobile extensions**: Biometric auth, dark mode, gesture navigation, and offline sync are planned but gated behind roadmap checklists for prioritization.【F:frontend/flashcards-android/README.md†L73-L181】

## Integration Notes
- **API surface**: Align Retrofit interfaces with FastAPI routes (see backend spec) and include JWT auth headers once tokens are issued by `/users/login`.
- **Offline strategy**: Cache decks/flashcards in Room, queue mutations when offline, and replay once connectivity resumes (per offline support goals).【F:frontend/flashcards-android/README.md†L175-L181】
- **Security**: Store tokens in encrypted DataStore, enable certificate pinning, and leverage biometric prompts where available to guard study sessions.【F:frontend/flashcards-android/README.md†L182-L187】
