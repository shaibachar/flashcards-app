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
    assert len(decks) == 1 and decks[0].id == "d" and decks[0].coverage == 0.0

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
    decks = deck_svc.get_all()
    ids = [d.id for d in decks]
    assert "e" in ids and "d" not in ids and all(d.coverage == 0.0 for d in decks)


def test_coverage_persists(monkeypatch):

    deck_svc = QdrantDeckService(collection="deck_cov")
    fc_svc = QdrantFlashcardService(collection="deck_cov_cards", deck_service=deck_svc)

    class DummyEmb:
        def embed(self, text: str):
            return [0.0] * fc_svc.vector_size

    monkeypatch.setattr(flashcard_module, "embedding_service", DummyEmb())

    card = Flashcard(question="q", answer="a", deck_id="d")
    fc_svc.index_flashcard(card)

    deck_svc.update_coverage("d", 55.0, 1)
    assert deck_svc.get_all()[0].coverage == 55.0

    # Adding another card triggers a deck index rebuild which should keep the
    # existing coverage value.
    fc_svc.index_flashcard(Flashcard(question="q2", answer="a2", deck_id="d"))
    decks = deck_svc.get_all()
    assert len(decks) == 1 and decks[0].coverage == 55.0
