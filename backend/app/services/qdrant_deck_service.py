from __future__ import annotations
from typing import List
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
except ImportError:  # pragma: no cover
    PointId = str  # type: ignore
import json
from ..models import Deck, Flashcard


class QdrantDeckService:
    def __init__(
        self,
        host: str = "10.0.0.9",
        port: int = 6334,
        collection: str = "decks",
        vector_size: int = 1,
    ):
        self.client = QdrantClient(host=host, grpc_port=port, prefer_grpc=True)
        self.collection = collection
        self.vector_size = vector_size
        self._ensure_collection()

    def _ensure_collection(self):
        existing = self.client.get_collections().collections
        names = [c.name for c in existing]
        if self.collection not in names:
            self.client.create_collection(
                collection_name=self.collection,
                vectors_config=VectorParams(size=self.vector_size, distance=Distance.COSINE),
            )

    def rebuild_from_flashcards(self, cards: List[Flashcard]):
        counts = {}
        for c in cards:
            if c.deck_id:
                counts.setdefault(c.deck_id, 0)
                counts[c.deck_id] += 1

        # Remove decks not present anymore
        existing, _ = self.client.scroll(collection_name=self.collection, limit=1000)
        existing_ids = {p.id for p in existing}
        to_remove = existing_ids - counts.keys()
        for deck_id in to_remove:
            flt = Filter(must=[HasIdCondition(has_id=[PointId(str(deck_id))])])
            self.client.delete(collection_name=self.collection, points_selector=flt)

        for deck_id, count in counts.items():
            deck = Deck(id=deck_id, description=f"Deck '{deck_id}' ({count} cards)")
            vector = [0.0] * self.vector_size
            payload = {"json": deck.json(), "count": count}
            point = PointStruct(id=str(deck.id), vector=vector, payload=payload)
            self.client.upsert(collection_name=self.collection, points=[point])

    def get_all(self) -> List[Deck]:
        points, _ = self.client.scroll(collection_name=self.collection, limit=1000)
        decks: List[Deck] = []
        for p in points:
            if p.payload and "json" in p.payload:
                data = json.loads(p.payload["json"])
                decks.append(Deck(**data))
        return decks
