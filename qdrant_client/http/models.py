class PointStruct:
    def __init__(self, id, vector, payload):
        self.id = id
        self.vector = vector
        self.payload = payload
        self.score = 1.0

class VectorParams:
    def __init__(self, size, distance):
        self.size = size
        self.distance = distance

class Distance:
    COSINE = "cosine"

class HasIdCondition:
    def __init__(self, has_id):
        self.has_id = has_id

class FieldCondition:
    def __init__(self, key, match):
        self.key = key
        self.match = match

class Filter:
    def __init__(self, must):
        self.must = must

PointId = str
