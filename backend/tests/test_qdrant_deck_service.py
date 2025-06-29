import backend.app.services.qdrant_flashcard_service as flashcard_module
from backend.app.services.qdrant_flashcard_service import QdrantFlashcardService
from backend.app.services.qdrant_deck_service import QdrantDeckService
from backend.app.models import Flashcard


def test_deck_index_updates(monkeypatch):
    deck_svc = QdrantDeckService(collection="deck_test")
    fc_svc = QdrantFlashcardService(collection="deck_cards", deck_service=deck_svc)

    class DummyEmb:
        def embed(self, text: str):
            return [0.0] * fc_svc.vector_size

    monkeypatch.setattr(flashcard_module, "embedding_service", DummyEmb())

    card = Flashcard(question="q", answer="a", deck_id="d")
    fc_svc.index_flashcard(card)
    decks = deck_svc.get_all()
    assert len(decks) == 1 and decks[0].id == "d"

    fc_svc.delete(card.id)
    assert deck_svc.get_all() == []


def test_deck_index_on_update(monkeypatch):
    deck_svc = QdrantDeckService(collection="deck_update")
    fc_svc = QdrantFlashcardService(collection="deck_cards2", deck_service=deck_svc)

    class DummyEmb:
        def embed(self, text: str):
            return [0.0] * fc_svc.vector_size

    monkeypatch.setattr(flashcard_module, "embedding_service", DummyEmb())

    card = Flashcard(question="q", answer="a", deck_id="d")
    fc_svc.index_flashcard(card)
    card.deck_id = "e"
    fc_svc.update(card)
    ids = [d.id for d in deck_svc.get_all()]
    assert "e" in ids and "d" not in ids
