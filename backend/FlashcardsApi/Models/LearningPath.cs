using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

public class LearningPath
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = ObjectId.GenerateNewId().ToString();
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; }= string.Empty;
    public List<string>? CardIds { get; set; }
}
