import os
from dotenv import load_dotenv
load_dotenv()
from qdrant_client import QdrantClient

QDRANT_HOST = os.environ.get("QDRANT_HOST")
if not QDRANT_HOST:
    raise RuntimeError("QDRANT_HOST must be set in a .env file or environment variable.")
QDRANT_PORT = int(os.environ.get("QDRANT_PORT", 6333))  # REST API port

qdrant = QdrantClient(host=QDRANT_HOST, port=QDRANT_PORT)

# List all collections
collections = qdrant.get_collections().collections
print(f"Collections on Qdrant server {QDRANT_HOST}:{QDRANT_PORT}:")
for col in collections:
    print(f"\nCollection: {col.name}")
    # Print a few points from each collection
    try:
        result, _ = qdrant.scroll(collection_name=col.name, limit=5)
        points = result
        if not points:
            print("  (No points in this collection)")
        else:
            for i, pt in enumerate(points, 1):
                print(f"  Point {i}: id={pt.id}, payload={pt.payload}")
    except Exception as e:
        print(f"  Error reading collection: {e}")
