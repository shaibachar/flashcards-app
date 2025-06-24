from __future__ import annotations
from typing import List, Iterable, Tuple, Optional
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
from ..models import LearningPath
import uuid
import os
import random
import json


class QdrantLearningPathService:
    def __init__(
        self,
        host: str = "10.0.0.9",
        port: int = 6334,
        collection: str = "learning_paths",
        vector_size: int = 64,
    ):
        # The provided port corresponds to the gRPC interface.  Configure the
        # client to use it instead of the REST API.
        self.client = QdrantClient(host=host, grpc_port=port, prefer_grpc=True)
        self.collection = collection
        self.vector_size = vector_size
        self._ensure_collection()

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

    def add(self, path: LearningPath):
        """Add a learning path to the Qdrant collection."""
        # If the path does not have an ID, generate a new one.
        # If the ID is in the form of a dictionary, extract the UUID.
        # Otherwise, use the existing ID.

        if not path.id:
            path.id = str(uuid.uuid4())
        elif isinstance(path.id, dict) and "uuid" in path.id:
            path.id = str(path.id["uuid"])
        vector = [0.0] * self.vector_size
        # Ensure the point id is a simple string before sending it to Qdrant.
        point = PointStruct(
            id=str(path.id), vector=vector, payload={"json": path.json()}
        )
        self.client.upsert(collection_name=self.collection, points=[point])

    def update(self, path: LearningPath):
        self.add(path)

    def delete(self, path_id: str):
        flt = Filter(must=[HasIdCondition(has_id=[PointId(str(path_id))])])
        self.client.delete(collection_name=self.collection, points_selector=flt)

    def get_all(self) -> List[LearningPath]:
        points = self.client.scroll(collection_name=self.collection, limit=1000)[0]
        paths: List[LearningPath] = []
        for p in points:
            if p.payload and "json" in p.payload:
                data = json.loads(p.payload["json"])
                paths.append(LearningPath(**data))
        return paths

    def get_by_id(self, path_id: str) -> Optional[LearningPath]:
        """Retrieve a learning path by its ID."""
        points = self.client.scroll(
            collection_name=self.collection,
            limit=1,
            filter=Filter(must=[HasIdCondition(has_id=[PointId(str(path_id))])]),
        )[0]
        for p in points:
            if p.payload and "json" in p.payload:
                data = json.loads(p.payload["json"])
                return LearningPath(**data)
        return None

    def seed_from_json(self, path: str) -> Tuple[bool, str]:
        """Seed the Qdrant collection with learning paths from a JSON file."""

        if not os.path.exists(path):
            return False, "learning-paths.json not found"
        with open(path, "r", encoding="utf-8") as f:
            paths = json.load(f)
        if not isinstance(paths, Iterable):
            return False, "Invalid JSON content"
        count = 0
        for data in paths:
            lp = LearningPath(**data)
            if not lp.id:
                lp.id = str(uuid.uuid4())
            self.add(lp)
            count += 1
        return True, f"{count} learning paths seeded."
