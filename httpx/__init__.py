class HTTPStatusError(Exception):
    """Stub HTTPStatusError"""
    pass

class AsyncClient:
    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc, tb):
        pass

    async def post(self, *args, **kwargs):
        raise NotImplementedError("AsyncClient.post should be patched in tests")
