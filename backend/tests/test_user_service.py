import json
from backend.app.services.user_service import UserService, User


def test_user_service_operations(tmp_path):
    path = tmp_path / "users.json"
    svc = UserService(str(path))
    assert svc.validate_credentials("admin", "admin123")
    assert svc.get_by_username("admin") is not None

    user = User(id="1", username="u", password_hash=svc.hash_password("p"))
    svc.add(user)
    assert svc.get_by_username("u") == user

    user.settings.flashcard_font_size = 22
    svc.update(user)
    assert svc.get_by_id("1").settings.flashcard_font_size == 22

    svc.delete("1")
    assert svc.get_by_username("u") is None


def test_user_service_load_invalid(tmp_path):
    path = tmp_path / "users.json"
    path.write_text("invalid")
    svc = UserService(str(path))
    assert svc.get_by_username("admin") is not None
