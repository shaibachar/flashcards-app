import json
import os
from python_backend.app.services.qdrant_flashcard_service import QdrantFlashcardService
from python_backend.app.models import Flashcard


def test_flashcard_service(tmp_path):
    svc = QdrantFlashcardService(collection="test")
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
