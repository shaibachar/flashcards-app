from __future__ import annotations
from typing import List, Iterable, Tuple
from qdrant_client import QdrantClient
from qdrant_client.http.models import (
    PointStruct,
    VectorParams,
    Distance,
    Filter,
    HasIdCondition,
)

try:
    from qdrant_client.http.models import PointId
except ImportError:  # Older or newer qdrant-client versions may not expose PointId
    PointId = str  # type: ignore
from ..models import Flashcard, Deck
from .embedding import embedding_service
from .qdrant_deck_service import QdrantDeckService
import uuid
import os
import random
import json


def _is_uuid(value: str) -> bool:
    """Return ``True`` if ``value`` is a valid UUID string."""
    try:
        uuid.UUID(str(value))
    except Exception:
        return False
    return True


class QdrantFlashcardService:
    def __init__(
        self,
        host: str = "10.0.0.9",
        port: int = 6334,
        collection: str = "flashcards",
        vector_size: int = 384,
        deck_service: "QdrantDeckService | None" = None,
    ):
        # `qdrant-client` expects REST port in the `port` argument and gRPC port
        # in `grpc_port`.  Our environment variables provide the gRPC port (6334
        # by default) so we configure the client accordingly and explicitly
        # prefer gRPC.
        self.client = QdrantClient(host=host, grpc_port=port, prefer_grpc=True)
        self.collection = collection
        self.vector_size = vector_size
        self._ensure_collection()
        self.deck_service = deck_service

    def _update_decks_index(self):
        if self.deck_service:
            self.deck_service.rebuild_from_flashcards(self.get_all())

    def _ensure_collection(self):
        # Ensure the collection exists.  If it does not, create it with the
        # specified vector size and distance metric.
        # Note: This does not check for existing collections with the same name
        # but rather creates a new one if it does not exist.

        existing = self.client.get_collections().collections
        names = [c.name for c in existing]
        if self.collection not in names:
            self.client.create_collection(
                collection_name=self.collection,
                vectors_config=VectorParams(
                    size=self.vector_size, distance=Distance.COSINE
                ),
            )

    def index_flashcard(self, card: Flashcard):
        if isinstance(card.id, dict) and "uuid" in card.id:
            card.id = str(card.id["uuid"])
        if not card.id or not _is_uuid(card.id):
            card.id = str(uuid.uuid4())
        # Compute embedding for the question.  Fallback to a zero vector if the
        # question is empty to keep behaviour predictable in tests.
        vector = embedding_service.embed(card.question or "")
        # Ensure vector has the expected size as Qdrant requires fixed length
        # vectors.
        vector = (vector + [0.0] * self.vector_size)[: self.vector_size]
        # Qdrant expects the point id to be a plain string or integer. When
        # importing data previously exported from Qdrant the ``id`` field may
        # appear in the ``{"uuid": "<value>"}`` form.  The ``Flashcard`` model
        # already normalises this, but we cast here as an extra safeguard
        # before sending data to the client.
        point = PointStruct(id=str(card.id), vector=vector, payload=card.dict())
        self.client.upsert(collection_name=self.collection, points=[point])
        self._update_decks_index()

    def update(self, card: Flashcard):
        self.index_flashcard(card)

    def get_all(self) -> List[Flashcard]:
        """Return all flashcards stored in the collection."""

        cards: List[Flashcard] = []
        next_page = None

        while True:
            try:
                # ``qdrant-client`` returns a tuple ``(points, next_page)``.
                # Older versions (or our lightweight test stub) may not accept
                # the ``offset`` parameter.  We attempt to use it and fall back
                # if it is unsupported.
                points, next_page = self.client.scroll(
                    collection_name=self.collection, limit=1000, offset=next_page
                )
            except TypeError:  # pragma: no cover - compatibility with stub
                points, _ = self.client.scroll(
                    collection_name=self.collection, limit=1000
                )
                next_page = None

            for p in points:
                if p.payload:
                    cards.append(Flashcard(**p.payload))

            if not next_page:
                break

        return cards

    def get_random(self, count: int = 10) -> List[Flashcard]:
        cards = self.get_all()
        random.shuffle(cards)
        return cards[:count]

    def update_score(self, card_id: str, score: int):
        cards = self.get_all()
        for c in cards:
            if c.id == card_id:
                c.score = score
                self.update(c)
                break

    def delete(self, card_id: str):
        flt = Filter(must=[HasIdCondition(has_id=[PointId(str(card_id))])])
        self.client.delete(collection_name=self.collection, points_selector=flt)
        self._update_decks_index()

    def seed_from_json(self, path: str) -> Tuple[bool, str]:
        if not os.path.exists(path):
            return False, "flashcards.json not found"
        with open(path, "r", encoding="utf-8") as f:
            cards = json.load(f)
        if not isinstance(cards, Iterable):
            return False, "Invalid JSON content"
        count = 0
        for data in cards:
            card = Flashcard(**data)
            if not card.id:
                card.id = str(uuid.uuid4())
            self.index_flashcard(card)
            count += 1
        self._update_decks_index()
        return True, f"{count} flashcards seeded."

    def get_random_by_deck(self, deck_id: str, count: int = 10) -> List[Flashcard]:
        cards = [c for c in self.get_all() if c.deck_id == deck_id]
        random.shuffle(cards)
        return cards[:count]

    def get_all_decks(self) -> List[Deck]:
        if self.deck_service:
            return self.deck_service.get_all()
        cards = [c for c in self.get_all() if c.deck_id]
        decks = {}
        for c in cards:
            decks.setdefault(c.deck_id, 0)
            decks[c.deck_id] += 1
        return [
            Deck(id=k, description=f"Deck '{k}' ({v} cards)", coverage=0.0) for k, v in decks.items()
        ]

    def query_by_vector(self, vector: List[float], count: int = 10) -> List[Flashcard]:
        res = self.client.search(
            collection_name=self.collection, query_vector=vector, limit=count
        )
        cards = []
        for p in res:
            if p.payload:
                cards.append(Flashcard(**p.payload))
        return cards

    def query_by_vector_with_score(
        self, vector: List[float], count: int = 10
    ) -> List[Tuple[Flashcard, float]]:
        res = self.client.search(
            collection_name=self.collection, query_vector=vector, limit=count
        )
        results: List[Tuple[Flashcard, float]] = []
        for p in res:
            if p.payload:
                results.append((Flashcard(**p.payload), p.score))
        return results

    def rename_deck(self, old_id: str, new_id: str) -> int:
        """Rename ``old_id`` deck to ``new_id`` across all flashcards.

        Returns the number of cards updated."""
        cards = self.get_all()
        updated = 0
        for card in cards:
            if card.deck_id == old_id:
                card.deck_id = new_id
                self.update(card)
                updated += 1
        return updated

    def cleanup_image_fields(self) -> int:
        """Ensure image fields are present and not set to the string ``"none"``.

        Returns the number of flashcards that were modified."""

        cards = self.get_all()
        updated = 0
        for card in cards:
            changed = False
            if getattr(card, "question_image", None) in (None, "none"):
                card.question_image = ""
                changed = True
            if getattr(card, "answer_image", None) in (None, "none"):
                card.answer_image = ""
                changed = True
            if getattr(card, "explanation_image", None) in (None, "none"):
                card.explanation_image = ""
                changed = True
            if changed:
                self.update(card)
                updated += 1
        return updated
