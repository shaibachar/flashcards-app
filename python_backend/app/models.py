from typing import List, Optional
from pydantic import BaseModel, Field
import uuid

class Flashcard(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    question: str = ""
    answer: str = ""
    score: int = 0
    deck_id: str = ""
    explanation: str = ""
    topic: str = ""

class Deck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    description: str = ""

class LearningPath(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str = ""
    description: str = ""
    card_ids: Optional[List[str]] = None
    topics: Optional[List[str]] = None

class UserSettings(BaseModel):
    flashcard_font_size: int = 18

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    password_hash: str
    roles: List[str] = Field(default_factory=lambda: ["user"])
    settings: UserSettings = Field(default_factory=UserSettings)
