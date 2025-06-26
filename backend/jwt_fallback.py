import base64
import json
from datetime import datetime

def encode(payload, key, algorithm="HS256"):
    header = {"alg": algorithm, "typ": "JWT"}
    def default(obj):
        if isinstance(obj, datetime):
            return obj.isoformat()
        raise TypeError(f"Object of type {obj.__class__.__name__} is not JSON serializable")

    def b64(data):
        return base64.urlsafe_b64encode(json.dumps(data, default=default).encode()).rstrip(b"=").decode()
    segments = [b64(header), b64(payload), base64.urlsafe_b64encode(key.encode()).rstrip(b"=").decode()]
    return ".".join(segments)
