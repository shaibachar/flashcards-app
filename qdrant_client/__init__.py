from .http.models import (
    PointStruct,
    VectorParams,
    Distance,
    Filter,
    FieldCondition,
    HasIdCondition,
    PointId,
)


class QdrantClient:
    def __init__(self, host="localhost", grpc_port=6334, prefer_grpc=True):
        self.host = host
        self.grpc_port = grpc_port
        self.storage = {}
        self.collections = set()

    def get_collections(self):
        class Resp:
            def __init__(self, collections):
                self.collections = list(collections)

        return Resp(self.collections)

    def recreate_collection(self, collection_name, vectors_config):
        self.collections.add(collection_name)
        self.storage[collection_name] = []

    def create_collection(self, collection_name, vectors_config):
        if collection_name not in self.collections:
            self.collections.add(collection_name)
            self.storage.setdefault(collection_name, [])

    def upsert(self, collection_name, points):
        self.storage.setdefault(collection_name, [])
        for p in points:
            self.storage[collection_name] = [
                q for q in self.storage[collection_name] if q.id != p.id
            ]
            self.storage[collection_name].append(p)

    def scroll(self, collection_name, limit=1000, filter=None):
        data = self.storage.get(collection_name, [])
        if filter:
            cond = filter.must[0]
            if hasattr(cond, "has_id"):
                ids = [str(i) for i in cond.has_id]
            else:
                ids = [str(i) for i in getattr(cond, "match", cond).has_id]
            data = [p for p in data if str(p.id) in ids]
        return data[:limit], None

    def delete(self, collection_name, points_selector):
        cond = points_selector.must[0]
        if hasattr(cond, "has_id"):
            ids = [str(i) for i in cond.has_id]
        else:
            ids = [str(i) for i in getattr(cond, "match", cond).has_id]
        self.storage[collection_name] = [
            p for p in self.storage.get(collection_name, []) if str(p.id) not in ids
        ]

    def search(self, collection_name, query_vector, limit=10):
        points = list(self.storage.get(collection_name, []))

        def cosine(a, b):
            dot = sum(x * y for x, y in zip(a, b))
            norm_a = sum(x * x for x in a) ** 0.5
            norm_b = sum(x * x for x in b) ** 0.5
            if norm_a == 0 and norm_b == 0:
                return 1.0
            if norm_a == 0 or norm_b == 0:
                return 0.0
            return dot / (norm_a * norm_b)

        scored = []
        for p in points:
            score = cosine(query_vector, p.vector)
            res = PointStruct(p.id, p.vector, p.payload)
            res.score = score
            scored.append(res)

        scored.sort(key=lambda p: p.score, reverse=True)
        return scored[:limit]
