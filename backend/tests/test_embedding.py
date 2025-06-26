import asyncio
from backend.app.services import embedding


def test_get_embedding(monkeypatch, tmp_path):
    service = embedding.EmbeddingService(cache_file=str(tmp_path / "c.json"))

    class DummyModel:
        def encode(self, sentence, convert_to_numpy=True):
            return [3, 4]

    service.model = DummyModel()
    monkeypatch.setattr(embedding, "embedding_service", service)

    emb = asyncio.run(embedding.get_embedding(" hi "))
    assert emb == [0.6, 0.8]



def test_embed_array_distance(monkeypatch, tmp_path):
    service = embedding.EmbeddingService(cache_file=str(tmp_path / "c.json"))

    class DummyModel:
        def encode(self, sentence, convert_to_numpy=True):
            return [1, 0] if "banana" in sentence else [0, 1]

    service.model = DummyModel()
    monkeypatch.setattr(embedding, "embedding_service", service)

    questions = ["apple", "banana", "cherry"]
    vectors = service.embed_sentences(questions)
    vec = service.embed("banana")
    sims = [sum(a*b for a, b in zip(vec, v)) for v in vectors]
    assert sims[1] == 1.0
