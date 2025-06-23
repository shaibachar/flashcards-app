import httpx
from typing import List

async def get_embedding(sentence: str, url: str) -> List[float]:
    async with httpx.AsyncClient() as client:
        payload = {"sentences": [sentence.strip()]}
        r = await client.post(url, json=payload)
        r.raise_for_status()
        data = r.json()
        emb = data.get("embeddings", [[]])[0]
        norm = sum(x*x for x in emb) ** 0.5
        if norm:
            emb = [x / norm for x in emb]
        return emb
