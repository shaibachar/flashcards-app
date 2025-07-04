from fastapi import APIRouter, HTTPException, Body, UploadFile
from typing import List
import re
from pydantic import BaseModel
import os
import sys
from datetime import datetime, timedelta
try:
    import jwt  # Provided by PyJWT
    if not hasattr(jwt, "encode"):
        raise ImportError
except ImportError:  # Fallback to bundled stub when dependency missing or wrong package
    import importlib.util
    import pathlib

    stub_path = pathlib.Path(__file__).resolve().parents[1] / "jwt_fallback.py"
    spec = importlib.util.spec_from_file_location("jwt_fallback", stub_path)
    jwt = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(jwt)

try:
    import multipart  # Provided by python-multipart
    from multipart.multipart import parse_options_header
    if not hasattr(multipart, "__version__") or not callable(parse_options_header):
        raise ImportError
except Exception:  # Fallback to bundled stub when dependency missing or wrong package
    import importlib.util
    import pathlib
    stub_dir = pathlib.Path(__file__).resolve().parents[1] / "multipart"
    init_path = stub_dir / "__init__.py"
    mod_spec = importlib.util.spec_from_file_location("multipart", init_path)
    multipart = importlib.util.module_from_spec(mod_spec)
    mod_spec.loader.exec_module(multipart)
    sys.modules["multipart"] = multipart
    sub_spec = importlib.util.spec_from_file_location(
        "multipart.multipart", stub_dir / "multipart.py"
    )
    submodule = importlib.util.module_from_spec(sub_spec)
    sub_spec.loader.exec_module(submodule)
    sys.modules["multipart.multipart"] = submodule

from .models import (
    Flashcard,
    Deck,
    LearningPath,
    User,
    UserSettings,
    AddUserRequest,
)
from . import main
from .services.llm_service import llm_service

router = APIRouter()

# Rebuild deck index if it has not been refreshed recently.  ``_last_deck_update``
# tracks when decks were last rebuilt, and ``_DECK_TTL`` specifies how long to
# keep the cached deck list before refreshing.
_DECK_TTL = timedelta(days=1)
_last_deck_update = datetime.min

_clean_re = re.compile(r"\W+")


def _clean_question(q: str) -> str:
    """Normalize question string for duplicate detection."""
    return _clean_re.sub("", q).lower()


@router.post("/Flashcards", response_model=Flashcard)
async def create_flashcard(card: Flashcard):
    main.flashcard_service.index_flashcard(card)
    return card

# Lowercase alias for case-insensitive clients
@router.post("/flashcards", response_model=Flashcard, include_in_schema=False)
async def create_flashcard_lower(card: Flashcard):
    return await create_flashcard(card)


@router.get("/Flashcards", response_model=List[Flashcard])
async def get_flashcards():
    return main.flashcard_service.get_all()

# Lowercase alias
@router.get("/flashcards", response_model=List[Flashcard], include_in_schema=False)
async def get_flashcards_lower():
    return await get_flashcards()


@router.put("/Flashcards/{id}")
async def update_flashcard(id: str, card: Flashcard):
    if id != card.id:
        raise HTTPException(status_code=400, detail="Mismatched id")
    main.flashcard_service.update(card)
    return {"status": "ok"}

# Lowercase alias
@router.put("/flashcards/{id}", include_in_schema=False)
async def update_flashcard_lower(id: str, card: Flashcard):
    return await update_flashcard(id, card)


@router.patch("/Flashcards/{id}/score")
async def update_score(id: str, score: int = Body(...)):
    main.flashcard_service.update_score(id, score)
    return {"status": "ok"}

# Lowercase alias
@router.patch("/flashcards/{id}/score", include_in_schema=False)
async def update_score_lower(id: str, score: int = Body(...)):
    return await update_score(id, score)


@router.delete("/Flashcards/{id}")
async def delete_flashcard(id: str):
    main.flashcard_service.delete(id)
    return {"status": "ok"}

# Lowercase alias
@router.delete("/flashcards/{id}", include_in_schema=False)
async def delete_flashcard_lower(id: str):
    return await delete_flashcard(id)


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
    global _last_deck_update
    decks = main.deck_service.get_all()
    now = datetime.utcnow()
    if not decks or now - _last_deck_update > _DECK_TTL:
        main.deck_service.rebuild_from_flashcards(main.flashcard_service.get_all())
        _last_deck_update = now
        decks = main.deck_service.get_all()
    return decks


@router.post("/decks/{deck_id}/coverage")
async def refresh_deck_coverage(deck_id: str):
    cards = [c for c in main.flashcard_service.get_all() if c.deck_id == deck_id]
    questions = [c.question for c in cards]
    coverage = llm_service.coverage(deck_id, questions)
    main.deck_service.update_coverage(deck_id, coverage, len(cards))
    return {"coverage": coverage}


class UpdateDeckRequest(BaseModel):
    id: str
    description: str


@router.put("/decks/{deck_id}", response_model=Deck)
async def update_deck(deck_id: str, req: UpdateDeckRequest):
    updated = main.flashcard_service.rename_deck(deck_id, req.id)
    main.deck_service.rebuild_from_flashcards(main.flashcard_service.get_all())
    count = updated
    deck = Deck(id=req.id, description=req.description, coverage=0.0)
    main.deck_service.update_deck(deck, count)
    return deck


@router.post("/Flashcards/query-vector", response_model=List[Flashcard])
async def query_vector(vector: List[float] = Body(...), count: int = 10):
    return main.flashcard_service.query_by_vector(vector, count)

# Lowercase alias
@router.post("/flashcards/query-vector", response_model=List[Flashcard], include_in_schema=False)
async def query_vector_lower(vector: List[float] = Body(...), count: int = 10):
    return await query_vector(vector, count)


class QueryStringRequest(BaseModel):
    query: str
    count: int = 10


@router.post("/Flashcards/query-string")
async def query_string(req: QueryStringRequest):
    vector = await main.get_embedding(req.query)
    results = main.flashcard_service.query_by_vector_with_score(vector, req.count)
    return [{"card": c.dict(), "score": s} for c, s in results]

# Lowercase alias
@router.post("/flashcards/query-string", include_in_schema=False)
async def query_string_lower(req: QueryStringRequest):
    return await query_string(req)


@router.post("/Flashcards/seed")
async def seed_flashcards():
    success, msg = main.flashcard_service.seed_from_json(
        os.path.join(os.path.dirname(__file__), "resources", "flashcards.json")
    )
    if not success:
        raise HTTPException(status_code=400, detail=msg)
    return {"message": msg}

# Endpoint to normalise image fields across all flashcards
@router.post("/Flashcards/cleanup")
async def cleanup_flashcards():
    fixed = main.flashcard_service.cleanup_image_fields()
    return {"fixed": fixed}

# Lowercase alias
@router.post("/flashcards/seed", include_in_schema=False)
async def seed_flashcards_lower():
    return await seed_flashcards()

# Lowercase alias
@router.post("/flashcards/cleanup", include_in_schema=False)
async def cleanup_flashcards_lower():
    return await cleanup_flashcards()


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


@router.post("/users/login")
async def login(req: LoginRequest):
    if main.user_service.validate_credentials(req.username, req.password):
        user = main.user_service.get_by_username(req.username)
        key = os.getenv("JWT_KEY", "A_SUPER_SECRET_KEY_12345678901234567890!@#abcdEFGHijklMNOPqrstuvWXyz")
        issuer = os.getenv("JWT_ISSUER", "FlashcardsApi")
        audience = os.getenv("JWT_AUDIENCE", "FlashcardsApiUsers")
        expire_minutes = int(os.getenv("JWT_EXPIRE_MINUTES", "60"))
        payload = {
            "sub": user.id,
            "name": user.username,
            "roles": user.roles,
            "iss": issuer,
            "aud": audience,
            "exp": datetime.utcnow() + timedelta(minutes=expire_minutes),
        }
        token = jwt.encode(payload, key, algorithm="HS256")
        return {
            "token": token,
            "user": {"id": user.id, "username": user.username, "roles": user.roles},
        }
    raise HTTPException(status_code=401, detail="Invalid credentials")


@router.get("/users", response_model=List[User])
async def get_users():
    return main.user_service.get_all()


@router.post("/users", response_model=User)
async def add_user(req: AddUserRequest):
    """Create a new user from a plain password request."""
    user = User(
        username=req.username,
        password_hash=main.user_service.hash_password(req.password),
        roles=req.roles or ["user"],
    )
    main.user_service.add(user)
    return user


@router.get("/users/{id}", response_model=User)
async def get_user(id: str):
    user = main.user_service.get_by_id(id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.put("/users/{id}")
async def update_user(id: str, user: User):
    if id != user.id:
        raise HTTPException(status_code=400, detail="Mismatched id")
    main.user_service.update(user)
    return {"status": "ok"}


@router.delete("/users/{id}")
async def delete_user(id: str):
    main.user_service.delete(id)
    return {"status": "ok"}


@router.put("/users/{id}/settings")
async def update_settings(id: str, settings: UserSettings):
    user = main.user_service.get_by_id(id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.settings = settings
    main.user_service.update(user)
    return {"status": "ok"}


class GenerateRequest(BaseModel):
    question: str


@router.post("/api/generate/flashcards", response_model=Flashcard)
async def generate_flashcard(req: GenerateRequest):
    transformed = await llm_service.transform_question(req.question)
    result = await llm_service.ask(req.question)
    answer = result.get("answer", "")
    explanation = result.get("explanation", "")
    return Flashcard(question=transformed, questions=[transformed], answer=answer, explanation=explanation)


@router.post("/FlashcardBulkImport/upload-json")
async def bulk_import(cards: List[Flashcard]):
    existing_questions = {
        _clean_question(q)
        for c in main.flashcard_service.get_all()
        for q in ([c.question] + (c.questions or []))
    }
    imported = 0
    for card in cards:
        qs = card.questions or [card.question]
        cleaned_list = [_clean_question(q) for q in qs]
        if not any(cl in existing_questions for cl in cleaned_list):
            main.flashcard_service.index_flashcard(card)
            existing_questions.update(cleaned_list)
            imported += 1
    return {"message": f"Imported {imported} flashcards"}


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


@router.get('/images', response_model=List[str])
async def list_images():
    imgs = []
    for name in os.listdir(main.images_dir):
        if os.path.isfile(os.path.join(main.images_dir, name)):
            imgs.append(name)
    return imgs


@router.post('/images/upload')
async def upload_images(files: List[UploadFile]):
    for file in files:
        dest = os.path.join(main.images_dir, file.filename)
        with open(dest, 'wb') as f:
            f.write(await file.read())
    return {'status': 'ok'}


@router.delete('/images/{name}')
async def delete_image(name: str):
    path = os.path.join(main.images_dir, name)
    if os.path.exists(path):
        os.remove(path)
    return {'status': 'ok'}


class DeleteManyRequest(BaseModel):
    names: List[str]


class RenameRequest(BaseModel):
    oldName: str
    newName: str


@router.post('/images/delete')
async def delete_images(req: DeleteManyRequest):
    for name in req.names:
        path = os.path.join(main.images_dir, name)
        if os.path.exists(path):
            os.remove(path)
    return {'status': 'ok'}


@router.post('/images/rename')
async def rename_image(req: RenameRequest):
    old_path = os.path.join(main.images_dir, req.oldName)
    new_path = os.path.join(main.images_dir, req.newName)
    if os.path.exists(old_path):
        os.rename(old_path, new_path)
    return {'status': 'ok'}

