from __future__ import annotations
from typing import List, Iterable, Tuple
from qdrant_client import QdrantClient
from qdrant_client.http.models import PointStruct, VectorParams, Distance, Filter, FieldCondition, HasIdCondition
try:
    from qdrant_client.http.models import PointId
except ImportError:  # Older or newer qdrant-client versions may not expose PointId
    PointId = str  # type: ignore
from ..models import Flashcard, Deck
import uuid
import os
import random
import json

class QdrantFlashcardService:
    def __init__(self, host: str = "10.0.0.9", port: int = 6334, collection: str = "flashcards", vector_size: int = 384):
        # `qdrant-client` expects REST port in the `port` argument and gRPC port
        # in `grpc_port`.  Our environment variables provide the gRPC port (6334
        # by default) so we configure the client accordingly and explicitly
        # prefer gRPC.
        self.client = QdrantClient(host=host, grpc_port=port, prefer_grpc=True)
        self.collection = collection
        self.vector_size = vector_size
        self._ensure_collection()

    def _ensure_collection(self):
        if self.collection not in self.client.get_collections().collections:
            self.client.recreate_collection(collection_name=self.collection,
                                             vectors_config=VectorParams(size=self.vector_size, distance=Distance.COSINE))

    def index_flashcard(self, card: Flashcard):
        if not card.id:
            card.id = str(uuid.uuid4())
        vector = [0.0] * self.vector_size
        # Qdrant expects the point id to be a plain string or integer. When
        # importing data previously exported from Qdrant the ``id`` field may
        # appear in the ``{"uuid": "<value>"}`` form.  The ``Flashcard`` model
        # already normalises this, but we cast here as an extra safeguard
        # before sending data to the client.
        point = PointStruct(id=str(card.id), vector=vector,
                            payload=card.dict())
        self.client.upsert(collection_name=self.collection, points=[point])

    def update(self, card: Flashcard):
        self.index_flashcard(card)

    def get_all(self) -> List[Flashcard]:
        points = self.client.scroll(collection_name=self.collection, limit=1000)[0]
        cards: List[Flashcard] = []
        for p in points:
            if p.payload:
                cards.append(Flashcard(**p.payload))
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
        flt = Filter(must=[FieldCondition(key="id", match=HasIdCondition(has_id=[PointId(str(card_id))]))])
        self.client.delete(collection_name=self.collection, points_selector=flt)

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
        return True, f"{count} flashcards seeded."

    def get_random_by_deck(self, deck_id: str, count: int = 10) -> List[Flashcard]:
        cards = [c for c in self.get_all() if c.deck_id == deck_id]
        random.shuffle(cards)
        return cards[:count]

    def get_all_decks(self) -> List[Deck]:
        cards = [c for c in self.get_all() if c.deck_id]
        decks = {}
        for c in cards:
            decks.setdefault(c.deck_id, 0)
            decks[c.deck_id] += 1
        return [Deck(id=k, description=f"Deck '{k}' ({v} cards)") for k, v in decks.items()]

    def query_by_vector(self, vector: List[float], count: int = 10) -> List[Flashcard]:
        res = self.client.search(collection_name=self.collection, query_vector=vector, limit=count)
        cards = []
        for p in res:
            if p.payload:
                cards.append(Flashcard(**p.payload))
        return cards

    def query_by_vector_with_score(self, vector: List[float], count: int = 10) -> List[Tuple[Flashcard, float]]:
        res = self.client.search(collection_name=self.collection, query_vector=vector, limit=count)
        results: List[Tuple[Flashcard, float]] = []
        for p in res:
            if p.payload:
                results.append((Flashcard(**p.payload), p.score))
        return results
