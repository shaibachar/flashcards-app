import asyncio
import pytest
import uuid
from python_backend.app import main, routes
from python_backend.app.models import Flashcard, LearningPath
from python_backend.app.services.qdrant_flashcard_service import QdrantFlashcardService
from python_backend.app.services.qdrant_learning_path_service import QdrantLearningPathService
from python_backend.app.services.user_service import UserService
from python_backend.app.services import embedding


def setup_app(monkeypatch, tmp_path):
    fc = QdrantFlashcardService(collection="t1")
    lp = QdrantLearningPathService(collection="t2")
    users = UserService(str(tmp_path/"users.json"))
    monkeypatch.setattr(main, "flashcard_service", fc)
    monkeypatch.setattr(main, "learning_path_service", lp)
    monkeypatch.setattr(main, "user_service", users)
    async def dummy_emb(q):
        return [0.0] * fc.vector_size

    monkeypatch.setattr(embedding, "get_embedding", dummy_emb)
    monkeypatch.setattr(main, "get_embedding", dummy_emb)
    return fc, lp, users


def test_main_endpoints(monkeypatch, tmp_path):
    fc, lp, users = setup_app(monkeypatch, tmp_path)

    card = Flashcard(question="q", answer="a")
    created = asyncio.run(routes.create_flashcard(card))

    cards = asyncio.run(routes.get_flashcards())
    assert cards[0].question == "q"

    card.question = "q2"
    assert asyncio.run(routes.update_flashcard(card.id, card)) == {"status": "ok"}

    assert asyncio.run(routes.update_score(card.id, 5)) == {"status": "ok"}
    assert asyncio.run(routes.get_random())[0].id == card.id
    assert asyncio.run(routes.get_random_by_deck(card.deck_id))[0].id == card.id
    assert asyncio.run(routes.get_decks()) == []
    assert asyncio.run(routes.query_vector([0]*fc.vector_size))[0].id == card.id
    req = routes.QueryStringRequest(query="hi", count=1)
    qs = asyncio.run(routes.query_string(req))
    assert qs[0]["card"]["id"] == card.id

    msg = asyncio.run(routes.seed_flashcards())
    assert "flashcards seeded" in msg["message"]
    assert asyncio.run(routes.delete_flashcard(card.id)) == {"status": "ok"}

    path = LearningPath(name="p")
    assert asyncio.run(routes.add_path(path)) == {"status": "ok"}
    assert asyncio.run(routes.get_paths())[0].name == "p"
    assert asyncio.run(routes.update_path(path)) == {"status": "ok"}
    assert asyncio.run(routes.delete_path(path.id)) == {"status": "ok"}
    msg = asyncio.run(routes.seed_paths())
    assert "learning paths seeded" in msg["message"]

    req = routes.LoginRequest(username="admin", password="admin123")
    login_res = asyncio.run(routes.login(req))
    assert "user" in login_res
    assert "token" in login_res
    assert isinstance(login_res["token"], str)

    data = [Flashcard(question="q", answer="a")]
    assert asyncio.run(routes.bulk_import(data)) == {"message": f"Imported {len(data)} flashcards"}
    assert isinstance(asyncio.run(routes.bulk_export()), list)

    uid = str(uuid.uuid4())
    data = [Flashcard(id={"uuid": uid}, question="q2", answer="a2")]
    assert asyncio.run(routes.bulk_import(data)) == {"message": f"Imported {len(data)} flashcards"}
    assert any(c.id == uid for c in asyncio.run(routes.get_flashcards()))

