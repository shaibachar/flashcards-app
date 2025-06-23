from .http.models import PointStruct, VectorParams, Distance, Filter, FieldCondition, HasIdCondition, PointId

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

    def upsert(self, collection_name, points):
        self.storage.setdefault(collection_name, [])
        for p in points:
            self.storage[collection_name] = [q for q in self.storage[collection_name] if q.id != p.id]
            self.storage[collection_name].append(p)

    def scroll(self, collection_name, limit=1000, filter=None):
        data = self.storage.get(collection_name, [])
        if filter:
            ids = [str(i) for i in filter.must[0].match.has_id]
            data = [p for p in data if str(p.id) in ids]
        return data[:limit], None

    def delete(self, collection_name, points_selector):
        ids = [str(i) for i in points_selector.must[0].match.has_id]
        self.storage[collection_name] = [p for p in self.storage.get(collection_name, []) if str(p.id) not in ids]

    def search(self, collection_name, query_vector, limit=10):
        return self.storage.get(collection_name, [])[:limit]
