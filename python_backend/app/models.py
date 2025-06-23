from typing import List, Optional
from pydantic import BaseModel, Field
import uuid

class Flashcard(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    question: str = ""
    answer: str = ""
    score: int = 0
    deck_id: str = Field("", alias="deckId")
    explanation: str = ""
    topic: str = ""

    class Config:
        allow_population_by_field_name = True

class Deck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    description: str = ""

    class Config:
        allow_population_by_field_name = True

class LearningPath(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str = ""
    description: str = ""
    card_ids: Optional[List[str]] = Field(default=None, alias="cardIds")
    topics: Optional[List[str]] = None

    class Config:
        allow_population_by_field_name = True

class UserSettings(BaseModel):
    flashcard_font_size: int = Field(18, alias="flashcardFontSize")

    class Config:
        allow_population_by_field_name = True

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    password_hash: str = Field(alias="passwordHash")
    roles: List[str] = Field(default_factory=lambda: ["user"])
    settings: UserSettings = Field(default_factory=UserSettings)

    class Config:
        allow_population_by_field_name = True
