import json
import uuid
from python_backend.app.services.qdrant_learning_path_service import QdrantLearningPathService
from python_backend.app.models import LearningPath


def test_learning_path_service(tmp_path):
    svc = QdrantLearningPathService(collection="paths")
    lp = LearningPath(name="p", description="d")
    svc.add(lp)
    assert svc.get_all()[0].name == "p"
    assert svc.get_by_id(lp.id).name == "p"

    svc.update(lp)
    svc.delete(lp.id)
    assert svc.get_all() == []

    path = tmp_path / "learning-paths.json"
    path.write_text(json.dumps([{"name": "lp"}]))
    success, msg = svc.seed_from_json(str(path))
    assert success and "1 learning paths" in msg

    assert svc.seed_from_json("missing.json")[0] is False

def test_learning_path_service_accepts_dict_id(tmp_path):
    svc = QdrantLearningPathService(collection="paths2")
    uid = str(uuid.uuid4())
    lp = LearningPath(id={"uuid": uid}, name="p")
    svc.add(lp)
    assert svc.get_by_id(uid).id == uid
    svc.delete(uid)
