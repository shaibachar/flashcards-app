"""Add image fields to all flashcards in Qdrant."""
import os
from backend.app.services.qdrant_flashcard_service import QdrantFlashcardService
from backend.app.models import Flashcard

QDRANT_HOST = os.getenv("QDRANT_HOST", "10.0.0.9")
QDRANT_PORT = int(os.getenv("QDRANT_PORT", "6334"))

svc = QdrantFlashcardService(QDRANT_HOST, QDRANT_PORT)

cards = svc.get_all()
for c in cards:
    updated = False
    if not getattr(c, 'question_image', None):
        c.question_image = ''
        updated = True
    if not getattr(c, 'answer_image', None):
        c.answer_image = ''
        updated = True
    if not getattr(c, 'explanation_image', None):
        c.explanation_image = ''
        updated = True
    if updated:
        svc.update(c)
print(f"Processed {len(cards)} flashcards.")
