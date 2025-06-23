import httpx
import asyncio
from python_backend.app.services import embedding

class DummyResponse:
    def __init__(self, data, status=200):
        self._data = data
        self.status_code = status
    def json(self):
        return self._data
    def raise_for_status(self):
        if self.status_code >= 400:
            raise httpx.HTTPStatusError("", request=None, response=None)

class DummyClient:
    def __init__(self, response):
        self.response = response
        self.post_called_with = None
    async def __aenter__(self):
        return self
    async def __aexit__(self, exc_type, exc, tb):
        pass
    async def post(self, url, json):
        self.post_called_with = (url, json)
        return self.response

def test_get_embedding(monkeypatch):
    resp = DummyResponse({"embeddings": [[3, 4]]})
    dummy = DummyClient(resp)
    monkeypatch.setattr(httpx, "AsyncClient", lambda: dummy)
    emb = asyncio.run(embedding.get_embedding(" hi ", "http://x"))
    assert emb == [0.6, 0.8]
    assert dummy.post_called_with[0] == "http://x"
    assert dummy.post_called_with[1]["sentences"] == ["hi"]
