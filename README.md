# 📚 Flashcards AI Learning App

An interactive flashcard-based learning platform that allows users to study, create, manage, and generate flashcards using AI. Built with Angular (frontend), ASP.NET Core (backend), MongoDB/Elasticsearch (storage), and OpenAI GPT-4 (AI generation).

---

## ✨ Features

- ✅ Study random or deck-specific flashcards
- ✏️ Add / Edit / Delete flashcards via admin UI
- 📦 Deck management (auto-detected from flashcards)
- 🤖 Generate 50 high-quality flashcards with AI (OpenAI GPT-4)
- 🔍 Filter flashcards by question text
- 🌐 Fully functional REST API
- 💾 Dual backend support: InMemory, MongoDB, or Elasticsearch
- 📱 Installable PWA with offline support (caches decks and flashcards)

---

## 📸 Screenshots

### 🧠 Home – Deck Selection
![Decks](docs/images/home-decks.png)

### 🎓 Study Flashcards
![Study](docs/images/study-mode.png)

### 🛠️ Manage Flashcards
![Manage](docs/images/manage-flashcards.png)

### 🧭 Learning Paths
![Paths](docs/images/learning-paths.png)

---

## 🛠️ Tech Stack

| Layer         | Tech                                  |
|---------------|----------------------------------------|
| Frontend      | Angular + Bootstrap                    |
| Backend       | ASP.NET Core Web API                   |
| Storage       | MongoDB or Elasticsearch               |
| AI Generator  | OpenAI GPT-4 via `openai-dotnet`       |
| Format        | JSON-based flashcard structure         |

---

## 📂 Project Structure

```
├── backend
│   └── FlashcardsApi (ASP.NET Core API)
│       ├── Controllers
│       ├── Services (Elastic, Mongo, InMemory)
│       ├── Models (Flashcard, Deck)
├── frontend
│   └── flashcards-ui (Angular 17+ standalone)
│       ├── components: home, flashcard, admin
│       ├── services: FlashcardService, DeckService
│       ├── assets, styles, routing
├── docs
│   └── images (used in README)
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js + Angular CLI
- .NET 8+ SDK
- MongoDB or Elasticsearch running locally
- OpenAI API Key (for GPT-4 generation)

### Run Frontend

```bash
cd frontend/flashcards-ui
npm install
ng serve
```

When accessing the app from another device, use HTTPS so the service worker can
register and display the install icon:

```bash
ng serve --ssl --host 0.0.0.0
```

### Run Backend

```bash
cd backend/FlashcardsApi
dotnet run
```

### Build & Test

```bash
cd backend/FlashcardsApi
dotnet build
dotnet test
```

### Docker Compose

Spin up the entire stack (backend, frontend and Qdrant database) using Docker Compose:

```bash
docker-compose up
```

### API Docs (Swagger)
Visit [http://localhost:5000/swagger](http://localhost:5000/swagger)

### 🔐 Authentication
The backend secures admin routes using JWT tokens. Log in with the seeded
`admin` user to obtain a token. Include an `Authorization: Bearer <token>`
header when calling protected endpoints. See
[docs/api-authentication.md](docs/api-authentication.md) for detailed steps,
including how to create additional users.

---

## ⚙️ Environment Setup

Create a file: `appsettings.Development.json`

```json
{
  "OpenAI": {
    "ApiKey": "your-api-key-here"
  },
  "ElasticSearch": {
    "Url": "http://localhost:9200"
  },
  "Mongo": {
    "ConnectionString": "mongodb://localhost:27017",
    "Database": "FlashcardsDB"
  }
}
```

---

## 📤 API Highlights

| Method | Endpoint                      | Description                        |
|--------|-------------------------------|------------------------------------|
| GET    | `/flashcards`                 | Get all flashcards                 |
| GET    | `/flashcards/{deckId}/random`| Get random cards by deck           |
| POST   | `/flashcards`                 | Add a new flashcard                |
| PUT    | `/flashcards/{id}`            | Update flashcard                   |
| DELETE | `/flashcards/{id}`            | Delete flashcard                   |
| POST   | `/api/generate/flashcards`   | Generate flashcards with GPT-4     |

---

## 🧠 Flashcard Model

```json
{
  "id": "string",
  "question": "string",
  "answer": "string",
  "explanation": "string",
  "score": 0,
  "deckId": "string"
}
```

---

## 🙌 Contributing

Pull requests welcome! If you'd like to extend the platform (e.g., export to PDF, spaced repetition engine, or analytics), feel free to fork and contribute.

---

## 📃 License

MIT © 2024 FlashcardsAI Team