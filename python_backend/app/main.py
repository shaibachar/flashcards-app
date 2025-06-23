from fastapi import FastAPI, Depends, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from pydantic import BaseModel
import os
from dotenv import load_dotenv

from .models import Flashcard, Deck, LearningPath, User, UserSettings
from .services.qdrant_flashcard_service import QdrantFlashcardService
from .services.qdrant_learning_path_service import QdrantLearningPathService
from .services.user_service import UserService
from .services.embedding import get_embedding

ENV_NAME = os.getenv("ENV", "dev")
dotenv_file = ".env.dev" if ENV_NAME == "dev" else ".env.production"
load_dotenv(dotenv_file)

app = FastAPI(title="Flashcards API (Python)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

QDRANT_HOST = os.getenv("QDRANT_HOST", "10.0.0.9")
QDRANT_PORT = int(os.getenv("QDRANT_PORT", "6334"))
EMBEDDING_SERVER_URL = os.getenv("EMBEDDING_SERVER_URL", "http://10.0.0.9:8000/embed")

flashcard_service = QdrantFlashcardService(QDRANT_HOST, QDRANT_PORT)
learning_path_service = QdrantLearningPathService(QDRANT_HOST, QDRANT_PORT)
user_service = UserService()

@app.post("/Flashcards", response_model=Flashcard)
async def create_flashcard(card: Flashcard):
    flashcard_service.index_flashcard(card)
    return card

@app.get("/Flashcards", response_model=List[Flashcard])
async def get_flashcards():
    return flashcard_service.get_all()

@app.put("/Flashcards/{id}")
async def update_flashcard(id: str, card: Flashcard):
    if id != card.id:
        raise HTTPException(status_code=400, detail="Mismatched id")
    flashcard_service.update(card)
    return {"status": "ok"}

@app.patch("/Flashcards/{id}/score")
async def update_score(id: str, score: int = Body(...)):
    flashcard_service.update_score(id, score)
    return {"status": "ok"}

@app.delete("/Flashcards/{id}")
async def delete_flashcard(id: str):
    flashcard_service.delete(id)
    return {"status": "ok"}

@app.get("/Flashcards/random", response_model=List[Flashcard])
async def get_random(count: int = 10):
    return flashcard_service.get_random(count)

@app.get("/Flashcards/{deckId}/random", response_model=List[Flashcard])
async def get_random_by_deck(deckId: str, count: int = 10):
    return flashcard_service.get_random_by_deck(deckId, count)

@app.get("/decks", response_model=List[Deck])
async def get_decks():
    return flashcard_service.get_all_decks()

@app.post("/Flashcards/query-vector", response_model=List[Flashcard])
async def query_vector(vector: List[float] = Body(...), count: int = 10):
    return flashcard_service.query_by_vector(vector, count)

class QueryStringRequest(BaseModel):
    query: str
    count: int = 10

@app.post("/Flashcards/query-string")
async def query_string(req: QueryStringRequest):
    vector = await get_embedding(req.query, EMBEDDING_SERVER_URL)
    results = flashcard_service.query_by_vector_with_score(vector, req.count)
    return [{"card": c.dict(), "score": s} for c, s in results]

@app.post("/Flashcards/seed")
async def seed_flashcards():
    success, msg = flashcard_service.seed_from_json(os.path.join(os.path.dirname(__file__), "resources", "flashcards.json"))
    if not success:
        raise HTTPException(status_code=400, detail=msg)
    return {"message": msg}

@app.get("/api/learning-paths", response_model=List[LearningPath])
async def get_paths():
    return learning_path_service.get_all()

@app.post("/api/learning-paths")
async def add_path(path: LearningPath):
    learning_path_service.add(path)
    return {"status": "ok"}

@app.put("/api/learning-paths")
async def update_path(path: LearningPath):
    learning_path_service.update(path)
    return {"status": "ok"}

@app.delete("/api/learning-paths/{id}")
async def delete_path(id: str):
    learning_path_service.delete(id)
    return {"status": "ok"}

@app.post("/api/learning-paths/seed")
async def seed_paths():
    success, msg = learning_path_service.seed_from_json(os.path.join(os.path.dirname(__file__), "resources", "learning-paths.json"))
    if not success:
        raise HTTPException(status_code=400, detail=msg)
    return {"message": msg}

class LoginRequest(BaseModel):
    username: str
    password: str

@app.post("/Users/login")
async def login(req: LoginRequest):
    if user_service.validate_credentials(req.username, req.password):
        user = user_service.get_by_username(req.username)
        return {"user": {"id": user.id, "username": user.username, "roles": user.roles}}
    raise HTTPException(status_code=401, detail="Invalid credentials")

@app.get("/Users", response_model=List[User])
async def get_users():
    return user_service.get_all()

@app.post("/Users", response_model=User)
async def add_user(user: User):
    user_service.add(user)
    return user

@app.get("/Users/{id}", response_model=User)
async def get_user(id: str):
    user = user_service.get_by_id(id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.put("/Users/{id}")
async def update_user(id: str, user: User):
    if id != user.id:
        raise HTTPException(status_code=400, detail="Mismatched id")
    user_service.update(user)
    return {"status": "ok"}

@app.delete("/Users/{id}")
async def delete_user(id: str):
    user_service.delete(id)
    return {"status": "ok"}

@app.put("/Users/{id}/settings")
async def update_settings(id: str, settings: UserSettings):
    user = user_service.get_by_id(id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.settings = settings
    user_service.update(user)
    return {"status": "ok"}

@app.post("/api/generate/flashcards", response_model=Flashcard)
async def generate_flashcard(prompt: str = Body(...)):
    # Placeholder implementation that echoes the prompt as the question
    return Flashcard(question=prompt, answer="Generated answer")

@app.post("/FlashcardBulkImport/upload-json")
async def bulk_import(cards: List[Flashcard]):
    for card in cards:
        flashcard_service.index_flashcard(card)
    return {"message": f"Imported {len(cards)} flashcards"}

@app.get("/FlashcardBulkExport/export-json")
async def bulk_export():
    cards = flashcard_service.get_all()
    return [c.dict() for c in cards]

