from typing import List, Optional
from pydantic import BaseModel, Field
import pydantic
import json

try:
    from pydantic import ConfigDict  # Available in Pydantic v1 and v2
except ImportError:  # pragma: no cover - compatibility for very old versions
    ConfigDict = dict  # type: ignore

PYDANTIC_V2 = pydantic.version.VERSION.startswith("2")
import uuid

class Flashcard(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    question: str = ""
    answer: str = ""
    score: int = 0
    deck_id: str = Field("", alias="deckId")
    explanation: str = ""
    topic: str = ""

    if PYDANTIC_V2:
        @pydantic.field_validator("id", mode="before")  # type: ignore[attr-defined]
        def _normalize_id(cls, v):
            if isinstance(v, dict) and "uuid" in v:
                return str(v["uuid"])
            if isinstance(v, str):
                try:
                    data = json.loads(v)
                    if isinstance(data, dict) and "uuid" in data:
                        return str(data["uuid"])
                except Exception:
                    pass
            return str(v)
        model_config = ConfigDict(populate_by_name=True)
    else:  # pragma: no cover - compatibility for Pydantic v1
        @pydantic.validator("id", pre=True, allow_reuse=True)  # type: ignore[attr-defined]
        def _normalize_id(cls, v):
            if isinstance(v, dict) and "uuid" in v:
                return str(v["uuid"])
            if isinstance(v, str):
                try:
                    data = json.loads(v)
                    if isinstance(data, dict) and "uuid" in data:
                        return str(data["uuid"])
                except Exception:
                    pass
            return str(v)
        class Config:
            allow_population_by_field_name = True

class Deck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    description: str = ""

    if PYDANTIC_V2:
        model_config = ConfigDict(populate_by_name=True)
    else:  # pragma: no cover - compatibility for Pydantic v1
        class Config:
            allow_population_by_field_name = True

class LearningPath(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str = ""
    description: str = ""
    card_ids: Optional[List[str]] = Field(default=None, alias="cardIds")
    topics: Optional[List[str]] = None

    if PYDANTIC_V2:
        @pydantic.field_validator("id", mode="before")  # type: ignore[attr-defined]
        def _normalize_id(cls, v):
            if isinstance(v, dict) and "uuid" in v:
                return str(v["uuid"])
            if isinstance(v, str):
                try:
                    data = json.loads(v)
                    if isinstance(data, dict) and "uuid" in data:
                        return str(data["uuid"])
                except Exception:
                    pass
            return str(v)
        model_config = ConfigDict(populate_by_name=True)
    else:  # pragma: no cover - compatibility for Pydantic v1
        @pydantic.validator("id", pre=True, allow_reuse=True)  # type: ignore[attr-defined]
        def _normalize_id(cls, v):
            if isinstance(v, dict) and "uuid" in v:
                return str(v["uuid"])
            if isinstance(v, str):
                try:
                    data = json.loads(v)
                    if isinstance(data, dict) and "uuid" in data:
                        return str(data["uuid"])
                except Exception:
                    pass
            return str(v)
        class Config:
            allow_population_by_field_name = True

class UserSettings(BaseModel):
    flashcard_font_size: int = Field(18, alias="flashcardFontSize")

    if PYDANTIC_V2:
        model_config = ConfigDict(populate_by_name=True)
    else:  # pragma: no cover - compatibility for Pydantic v1
        class Config:
            allow_population_by_field_name = True

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    password_hash: str = Field(alias="passwordHash")
    roles: List[str] = Field(default_factory=lambda: ["user"])
    settings: UserSettings = Field(default_factory=UserSettings)

    if PYDANTIC_V2:
        model_config = ConfigDict(populate_by_name=True)
    else:  # pragma: no cover - compatibility for Pydantic v1
        class Config:
            allow_population_by_field_name = True
