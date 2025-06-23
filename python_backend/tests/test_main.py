import asyncio
import pytest
from python_backend.app import main
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
    async def dummy_emb(q, u):
        return [0.0] * fc.vector_size

    monkeypatch.setattr(embedding, "get_embedding", dummy_emb)
    monkeypatch.setattr(main, "get_embedding", dummy_emb)
    return fc, lp, users


def test_main_endpoints(monkeypatch, tmp_path):
    fc, lp, users = setup_app(monkeypatch, tmp_path)

    card = Flashcard(question="q", answer="a")
    created = asyncio.run(main.create_flashcard(card))

    cards = asyncio.run(main.get_flashcards())
    assert cards[0].question == "q"

    card.question = "q2"
    assert asyncio.run(main.update_flashcard(card.id, card)) == {"status": "ok"}

    assert asyncio.run(main.update_score(card.id, 5)) == {"status": "ok"}
    assert asyncio.run(main.get_random())[0].id == card.id
    assert asyncio.run(main.get_random_by_deck(card.deck_id))[0].id == card.id
    assert asyncio.run(main.get_decks()) == []
    assert asyncio.run(main.query_vector([0]*fc.vector_size))[0].id == card.id
    req = main.QueryStringRequest(query="hi", count=1)
    qs = asyncio.run(main.query_string(req))
    assert qs[0]["card"]["id"] == card.id

    msg = asyncio.run(main.seed_flashcards())
    assert "flashcards seeded" in msg["message"]
    assert asyncio.run(main.delete_flashcard(card.id)) == {"status": "ok"}

    path = LearningPath(name="p")
    assert asyncio.run(main.add_path(path)) == {"status": "ok"}
    assert asyncio.run(main.get_paths())[0].name == "p"
    assert asyncio.run(main.update_path(path)) == {"status": "ok"}
    assert asyncio.run(main.delete_path(path.id)) == {"status": "ok"}
    msg = asyncio.run(main.seed_paths())
    assert "learning paths seeded" in msg["message"]

    req = main.LoginRequest(username="admin", password="admin123")
    assert "user" in (asyncio.run(main.login(req)))

    data = [Flashcard(question="q", answer="a")]
    assert asyncio.run(main.bulk_import(data)) == {"message": f"Imported {len(data)} flashcards"}
    assert isinstance(asyncio.run(main.bulk_export()), list)
