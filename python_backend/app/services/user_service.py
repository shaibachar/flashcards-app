from __future__ import annotations
from typing import List, Optional
from ..models import User, UserSettings
import hashlib
import json
import uuid
import os

class UserService:
    """Service for managing users and their settings."""
    
    def __init__(self, path: str = "data/users.json"):
        self.path = path
        self._users: List[User] = []
        self._load()

    def _load(self):
        if os.path.exists(self.path):
            try:
                with open(self.path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    self._users = [User(**u) for u in data]
            except Exception:
                self._users = []
        if not self._users:
            admin = User(id=str(uuid.uuid4()), username="admin", password_hash=self.hash_password("admin123"), roles=["admin"])
            self._users.append(admin)
            self._save()

    def _save(self):
        os.makedirs(os.path.dirname(self.path), exist_ok=True)
        with open(self.path, "w", encoding="utf-8") as f:
            json.dump([u.dict() for u in self._users], f, indent=2)

    @staticmethod
    def hash_password(password: str) -> str:
        return hashlib.sha256(password.encode("utf-8")).hexdigest()

    def get_all(self) -> List[User]:
        return self._users

    def get_by_id(self, uid: str) -> Optional[User]:
        return next((u for u in self._users if u.id == uid), None)

    def get_by_username(self, username: str) -> Optional[User]:
        return next((u for u in self._users if u.username == username), None)

    def add(self, user: User):
        self._users.append(user)
        self._save()

    def update(self, user: User):
        for i, u in enumerate(self._users):
            if u.id == user.id:
                self._users[i] = user
                self._save()
                break

    def delete(self, uid: str):
        self._users = [u for u in self._users if u.id != uid]
        self._save()

    def validate_credentials(self, username: str, password: str) -> bool:
        user = self.get_by_username(username)
        if not user:
            return False
        return user.password_hash == self.hash_password(password)
