import json
import os
import uuid
import python_backend.app.services.qdrant_flashcard_service as flashcard_module
from python_backend.app.services.qdrant_flashcard_service import QdrantFlashcardService
from python_backend.app.models import Flashcard


def test_flashcard_service(tmp_path, monkeypatch):
    svc = QdrantFlashcardService(collection="test")
    class DummyEmb:
        def embed(self, text: str):
            return [0.0] * svc.vector_size

    monkeypatch.setattr(flashcard_module, "embedding_service", DummyEmb())
    card = Flashcard(question="q", answer="a", deck_id="d")
    svc.index_flashcard(card)
    assert svc.get_all()[0].question == "q"

    card.score = 5
    svc.update(card)
    assert svc.get_all()[0].score == 5

    svc.update_score(card.id, 7)
    assert svc.get_all()[0].score == 7

    assert svc.get_random(1)
    assert svc.get_random_by_deck("d", 1)
    assert svc.get_all_decks()[0].id == "d"
    assert svc.query_by_vector([0]*svc.vector_size, 1)
    assert svc.query_by_vector_with_score([0]*svc.vector_size, 1)[0][1] == 1.0

    svc.delete(card.id)
    assert svc.get_all() == []

    path = tmp_path / "flashcards.json"
    path.write_text(json.dumps([{"question": "x", "answer": "y"}]))
    success, msg = svc.seed_from_json(str(path))
    assert success and "1 flashcards" in msg

    assert svc.seed_from_json("missing.json")[0] is False

def test_flashcard_service_accepts_dict_id(tmp_path, monkeypatch):
    svc = QdrantFlashcardService(collection="test_dict")
    class DummyEmb:
        def embed(self, text: str):
            return [0.0] * svc.vector_size

    monkeypatch.setattr(flashcard_module, "embedding_service", DummyEmb())
    uid = str(uuid.uuid4())
    card = Flashcard(id={"uuid": uid}, question="q", answer="a")
    svc.index_flashcard(card)
    retrieved = svc.get_all()[0]
    assert retrieved.id == uid
    svc.delete(uid)
