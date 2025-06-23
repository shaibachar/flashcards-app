from fastapi import APIRouter, HTTPException, Body
from typing import List
from pydantic import BaseModel
import os

from .models import Flashcard, Deck, LearningPath, User, UserSettings
from . import main

router = APIRouter()


@router.post("/Flashcards", response_model=Flashcard)
async def create_flashcard(card: Flashcard):
    main.flashcard_service.index_flashcard(card)
    return card


@router.get("/Flashcards", response_model=List[Flashcard])
async def get_flashcards():
    return main.flashcard_service.get_all()


@router.put("/Flashcards/{id}")
async def update_flashcard(id: str, card: Flashcard):
    if id != card.id:
        raise HTTPException(status_code=400, detail="Mismatched id")
    main.flashcard_service.update(card)
    return {"status": "ok"}


@router.patch("/Flashcards/{id}/score")
async def update_score(id: str, score: int = Body(...)):
    main.flashcard_service.update_score(id, score)
    return {"status": "ok"}


@router.delete("/Flashcards/{id}")
async def delete_flashcard(id: str):
    main.flashcard_service.delete(id)
    return {"status": "ok"}


@router.get("/Flashcards/random", response_model=List[Flashcard])
async def get_random(count: int = 10):
    return main.flashcard_service.get_random(count)


@router.get("/flashcards/random", response_model=List[Flashcard], include_in_schema=False)
async def get_random_lower(count: int = 10):
    return await get_random(count)


@router.get("/Flashcards/{deckId}/random", response_model=List[Flashcard])
async def get_random_by_deck(deckId: str, count: int = 10):
    return main.flashcard_service.get_random_by_deck(deckId, count)


@router.get("/flashcards/{deckId}/random", response_model=List[Flashcard], include_in_schema=False)
async def get_random_by_deck_lower(deckId: str, count: int = 10):
    return await get_random_by_deck(deckId, count)


@router.get("/decks", response_model=List[Deck])
async def get_decks():
    return main.flashcard_service.get_all_decks()


@router.post("/Flashcards/query-vector", response_model=List[Flashcard])
async def query_vector(vector: List[float] = Body(...), count: int = 10):
    return main.flashcard_service.query_by_vector(vector, count)


class QueryStringRequest(BaseModel):
    query: str
    count: int = 10


@router.post("/Flashcards/query-string")
async def query_string(req: QueryStringRequest):
    vector = await main.get_embedding(req.query)
    results = main.flashcard_service.query_by_vector_with_score(vector, req.count)
    return [{"card": c.dict(), "score": s} for c, s in results]


@router.post("/Flashcards/seed")
async def seed_flashcards():
    success, msg = main.flashcard_service.seed_from_json(
        os.path.join(os.path.dirname(__file__), "resources", "flashcards.json")
    )
    if not success:
        raise HTTPException(status_code=400, detail=msg)
    return {"message": msg}


@router.get("/api/learning-paths", response_model=List[LearningPath])
async def get_paths():
    return main.learning_path_service.get_all()


@router.post("/api/learning-paths")
async def add_path(path: LearningPath):
    main.learning_path_service.add(path)
    return {"status": "ok"}


@router.put("/api/learning-paths")
async def update_path(path: LearningPath):
    main.learning_path_service.update(path)
    return {"status": "ok"}


@router.delete("/api/learning-paths/{id}")
async def delete_path(id: str):
    main.learning_path_service.delete(id)
    return {"status": "ok"}


@router.post("/api/learning-paths/seed")
async def seed_paths():
    success, msg = main.learning_path_service.seed_from_json(
        os.path.join(os.path.dirname(__file__), "resources", "learning-paths.json")
    )
    if not success:
        raise HTTPException(status_code=400, detail=msg)
    return {"message": msg}


class LoginRequest(BaseModel):
    username: str
    password: str


@router.post("/Users/login")
async def login(req: LoginRequest):
    if main.user_service.validate_credentials(req.username, req.password):
        user = main.user_service.get_by_username(req.username)
        return {"user": {"id": user.id, "username": user.username, "roles": user.roles}}
    raise HTTPException(status_code=401, detail="Invalid credentials")


@router.get("/Users", response_model=List[User])
async def get_users():
    return main.user_service.get_all()


@router.post("/Users", response_model=User)
async def add_user(user: User):
    main.user_service.add(user)
    return user


@router.get("/Users/{id}", response_model=User)
async def get_user(id: str):
    user = main.user_service.get_by_id(id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.put("/Users/{id}")
async def update_user(id: str, user: User):
    if id != user.id:
        raise HTTPException(status_code=400, detail="Mismatched id")
    main.user_service.update(user)
    return {"status": "ok"}


@router.delete("/Users/{id}")
async def delete_user(id: str):
    main.user_service.delete(id)
    return {"status": "ok"}


@router.put("/Users/{id}/settings")
async def update_settings(id: str, settings: UserSettings):
    user = main.user_service.get_by_id(id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.settings = settings
    main.user_service.update(user)
    return {"status": "ok"}


@router.post("/api/generate/flashcards", response_model=Flashcard)
async def generate_flashcard(prompt: str = Body(...)):
    return Flashcard(question=prompt, answer="Generated answer")


@router.post("/FlashcardBulkImport/upload-json")
async def bulk_import(cards: List[Flashcard]):
    for card in cards:
        main.flashcard_service.index_flashcard(card)
    return {"message": f"Imported {len(cards)} flashcards"}


@router.post("/flashcardbulkimport/upload-json", include_in_schema=False)
async def bulk_import_lower(cards: List[Flashcard]):
    return await bulk_import(cards)


@router.get("/FlashcardBulkExport/export-json")
async def bulk_export():
    cards = main.flashcard_service.get_all()
    return [c.dict() for c in cards]


@router.get("/flashcardbulkexport/export-json", include_in_schema=False)
async def bulk_export_lower():
    return await bulk_export()

