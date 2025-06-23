from __future__ import annotations
from typing import List
import json
import os

try:
    from sentence_transformers import SentenceTransformer
except ModuleNotFoundError:  # pragma: no cover - library may be absent in tests
    class SentenceTransformer:  # type: ignore
        def __init__(self, model_name: str, vector_size: int = 384):
            self.model_name = model_name
            self.vector_size = vector_size

        def encode(self, sentence, convert_to_numpy=True):
            if isinstance(sentence, list):
                sentence = " ".join(sentence)
            vec = [float((ord(c) % 10) / 10) for c in sentence]
            vec = (vec + [0.0] * self.vector_size)[: self.vector_size]
            return vec if convert_to_numpy else vec


class EmbeddingService:
    """Compute sentence embeddings with optional on-disk caching."""

    def __init__(self, model_name: str = "all-MiniLM-L6-v2", cache_file: str = "cache.json"):
        self.model = SentenceTransformer(model_name)
        self.cache_file = cache_file
        if os.path.exists(cache_file):
            with open(cache_file, "r", encoding="utf-8") as f:
                self.cache = json.load(f)
        else:
            self.cache = {}

    def embed_sentences(self, sentences: List[str]) -> List[List[float]]:
        result: List[List[float]] = []
        changed = False
        for sentence in sentences:
            if sentence in self.cache:
                vec = self.cache[sentence]
            else:
                vector = self.model.encode(sentence, convert_to_numpy=True)
                if hasattr(vector, "tolist"):
                    vector = vector.tolist()
                vec = vector
                self.cache[sentence] = vec
                changed = True
            norm = sum(x * x for x in vec) ** 0.5
            if norm:
                vec = [x / norm for x in vec]
            result.append(vec)
        if changed:
            with open(self.cache_file, "w", encoding="utf-8") as f:
                json.dump(self.cache, f, ensure_ascii=False)
        return result

    def embed(self, sentence: str) -> List[float]:
        return self.embed_sentences([sentence])[0]


# Default service instance used by the application
embedding_service = EmbeddingService()


async def get_embedding(sentence: str) -> List[float]:
    """Asynchronously return the embedding for a sentence."""
    return embedding_service.embed(sentence)
