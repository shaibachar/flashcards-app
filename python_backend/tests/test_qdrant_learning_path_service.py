import json
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
