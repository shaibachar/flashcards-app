import asyncio
import pytest
import uuid
import os
from fastapi import UploadFile
from backend.app import main, routes
from backend.app.models import Flashcard, LearningPath
from backend.app.services.qdrant_flashcard_service import QdrantFlashcardService
from backend.app.services.qdrant_learning_path_service import QdrantLearningPathService
import backend.app.services.qdrant_flashcard_service as flashcard_module
from backend.app.services.user_service import UserService
from backend.app.services import embedding


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
    class DummyEmb:
        def embed(self, text: str):
            return [0.0] * fc.vector_size

    monkeypatch.setattr(flashcard_module, "embedding_service", DummyEmb())
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
    assert asyncio.run(routes.bulk_import(data)) == {"message": "Imported 1 flashcards"}
    assert isinstance(asyncio.run(routes.bulk_export()), list)

    # Importing the same card again should not create a duplicate
    assert asyncio.run(routes.bulk_import(data)) == {"message": "Imported 0 flashcards"}

    # Variations with spaces or punctuation should also be ignored
    alt = [Flashcard(question="  q!! ", answer="a")]
    assert asyncio.run(routes.bulk_import(alt)) == {"message": "Imported 0 flashcards"}

    uid = str(uuid.uuid4())
    data = [Flashcard(id={"uuid": uid}, question="q2", answer="a2")]
    assert asyncio.run(routes.bulk_import(data)) == {"message": "Imported 1 flashcards"}
    assert any(c.id == uid for c in asyncio.run(routes.get_flashcards()))

    # Image endpoints
    images = asyncio.run(routes.list_images())
    assert isinstance(images, list)
    # create a dummy file for upload
    test_name = 'test.txt'
    with open(test_name, 'w') as f:
        f.write('x')
    with open(test_name, 'rb') as f:
        file = UploadFile(filename=test_name, file=f)
        asyncio.run(routes.upload_images([file]))
    assert test_name in asyncio.run(routes.list_images())
    asyncio.run(routes.delete_image(test_name))
    os.remove(test_name)

