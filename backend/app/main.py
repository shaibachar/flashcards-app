from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import os
import logging
from dotenv import load_dotenv

from .services.qdrant_flashcard_service import QdrantFlashcardService
from .services.qdrant_deck_service import QdrantDeckService
from .services.qdrant_learning_path_service import QdrantLearningPathService
from .services.user_service import UserService
from .services.embedding import get_embedding

ENV_NAME = os.getenv("ENV", "dev")
dotenv_file = ".env.dev" if ENV_NAME == "dev" else ".env.production"
load_dotenv(dotenv_file)
log_dir = os.path.join(os.path.dirname(__file__), '..', 'logging')
os.makedirs(log_dir, exist_ok=True)
log_file = os.path.join(log_dir, 'backend.log')
logging.basicConfig(level=logging.DEBUG, filename=log_file, filemode='a')

BASE_PATH = os.getenv("BASE_PATH", "")
app = FastAPI(title="Flashcards API (Python)", root_path=BASE_PATH)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

QDRANT_HOST = os.getenv("QDRANT_HOST", "10.0.0.9")
QDRANT_PORT = int(os.getenv("QDRANT_PORT", "6334"))

deck_service = QdrantDeckService(QDRANT_HOST, QDRANT_PORT)
flashcard_service = QdrantFlashcardService(QDRANT_HOST, QDRANT_PORT, deck_service=deck_service)
learning_path_service = QdrantLearningPathService(QDRANT_HOST, QDRANT_PORT)
user_service = UserService()

from . import routes

app.include_router(routes.router)

# Serve uploaded images
images_dir = os.path.join(os.path.dirname(__file__), 'resources', 'images')
os.makedirs(images_dir, exist_ok=True)
app.mount('/images', StaticFiles(directory=images_dir), name='images')
