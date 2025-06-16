import pymongo
import numpy as np
from qdrant_client import QdrantClient
from qdrant_client.http.models import PointStruct, VectorParams, Distance
from sentence_transformers import SentenceTransformer
import os
import uuid
from dotenv import load_dotenv

load_dotenv()

# MongoDB connection
MONGO_HOST = os.environ.get("MONGO_HOST")
if not MONGO_HOST:
    raise RuntimeError("MONGO_HOST must be set in a .env file or environment variable.")
MONGO_PORT = os.environ.get("MONGO_PORT", "27017")
MONGO_DB = os.environ.get("MONGO_DB", "flashcards")
MONGO_COLLECTION = os.environ.get("MONGO_COLLECTION", "flashcards")
MONGO_USER = os.environ.get("MONGO_USER")
MONGO_PASS = os.environ.get("MONGO_PASS")

if MONGO_USER and MONGO_PASS:
    MONGO_URI = f"mongodb://{MONGO_USER}:{MONGO_PASS}@{MONGO_HOST}:{MONGO_PORT}"
else:
    MONGO_URI = f"mongodb://{MONGO_HOST}:{MONGO_PORT}"

# Qdrant connection
QDRANT_HOST = os.environ.get("QDRANT_HOST")
if not QDRANT_HOST:
    raise RuntimeError("QDRANT_HOST must be set in a .env file or environment variable.")
QDRANT_PORT = int(os.environ.get("QDRANT_PORT", 6333))
QDRANT_COLLECTION = os.environ.get("QDRANT_COLLECTION", "flashcards")
VECTOR_SIZE = int(os.environ.get("VECTOR_SIZE", 384))  # Adjust to your embedding size

# Connect to MongoDB
mongo_client = pymongo.MongoClient(MONGO_URI)
mongo_db = mongo_client[MONGO_DB]
mongo_collection = mongo_db[MONGO_COLLECTION]

# Connect to Qdrant
qdrant = QdrantClient(host=QDRANT_HOST, port=QDRANT_PORT)

# Load embedding model
model = SentenceTransformer('all-MiniLM-L6-v2')

# Clean all data from Qdrant before import
if qdrant.collection_exists(collection_name=QDRANT_COLLECTION):
    qdrant.delete_collection(collection_name=QDRANT_COLLECTION)
    qdrant.create_collection(
        collection_name=QDRANT_COLLECTION,
        vectors_config=VectorParams(size=VECTOR_SIZE, distance=Distance.COSINE)
    )

# Helper: get embedding for a flashcard

def get_embedding(flashcard):
    text = f"{flashcard.get('question', '').strip()}"
    vector = model.encode(text)
    # Explicit normalization (for cosine similarity)
    vector /= np.linalg.norm(vector)
    return vector.tolist()

# Helper: convert MongoDB ObjectId to UUID
def mongo_id_to_uuid(mongo_id):
    # If already a valid UUID, return as is
    try:
        return str(uuid.UUID(str(mongo_id)))
    except Exception:
        pass
    # If 24-char hex (ObjectId), convert to UUID
    if isinstance(mongo_id, str) and len(mongo_id) == 24:
        return str(uuid.UUID(mongo_id.ljust(32, '0')))
    # Otherwise, fallback to a random UUID
    return str(uuid.uuid4())

# Transfer data
points = []
for doc in mongo_collection.find():
    # Prepare payload (remove _id, add all fields)
    payload = {k: v for k, v in doc.items() if k != "_id"}
    # Use string id as Qdrant id, convert to UUID if needed
    raw_id = doc.get("_id", payload.get("id", ""))
    qdrant_id = mongo_id_to_uuid(raw_id)
    # Get vector (embedding)
    vector = get_embedding(payload)
    points.append(PointStruct(id=qdrant_id, vector=vector, payload=payload))

# Upload in batches
BATCH_SIZE = 64
for i in range(0, len(points), BATCH_SIZE):
    batch = points[i:i+BATCH_SIZE]
    qdrant.upsert(collection_name=QDRANT_COLLECTION, points=batch)

print(f"Transferred {len(points)} flashcards from MongoDB to Qdrant.")
