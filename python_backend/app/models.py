from typing import List, Optional
from pydantic import BaseModel, Field
try:
    from pydantic import ConfigDict  # Pydantic v2
except ImportError:  # pragma: no cover - compatibility for Pydantic v1
    ConfigDict = dict  # type: ignore
import uuid

class Flashcard(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
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
    model_config = ConfigDict(populate_by_name=True)
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    description: str = ""

    class Config:
        allow_population_by_field_name = True

class LearningPath(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str = ""
    description: str = ""
    card_ids: Optional[List[str]] = Field(default=None, alias="cardIds")
    topics: Optional[List[str]] = None

    class Config:
        allow_population_by_field_name = True

class UserSettings(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    flashcard_font_size: int = Field(18, alias="flashcardFontSize")

    class Config:
        allow_population_by_field_name = True

class User(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    password_hash: str = Field(alias="passwordHash")
    roles: List[str] = Field(default_factory=lambda: ["user"])
    settings: UserSettings = Field(default_factory=UserSettings)

    class Config:
        allow_population_by_field_name = True
