from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

from .services.qdrant_flashcard_service import QdrantFlashcardService
from .services.qdrant_learning_path_service import QdrantLearningPathService
from .services.user_service import UserService
from .services.embedding import get_embedding

ENV_NAME = os.getenv("ENV", "dev")
dotenv_file = ".env.dev" if ENV_NAME == "dev" else ".env.production"
load_dotenv(dotenv_file)

app = FastAPI(title="Flashcards API (Python)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

QDRANT_HOST = os.getenv("QDRANT_HOST", "10.0.0.9")
QDRANT_PORT = int(os.getenv("QDRANT_PORT", "6334"))

flashcard_service = QdrantFlashcardService(QDRANT_HOST, QDRANT_PORT)
learning_path_service = QdrantLearningPathService(QDRANT_HOST, QDRANT_PORT)
user_service = UserService()

from . import routes

app.include_router(routes.router)

# Serve uploaded images
images_dir = os.path.join(os.path.dirname(__file__), 'resources', 'images')
os.makedirs(images_dir, exist_ok=True)
app.mount('/images', StaticFiles(directory=images_dir), name='images')
