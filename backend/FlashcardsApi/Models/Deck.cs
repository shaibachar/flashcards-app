using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

public class Deck
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = ObjectId.GenerateNewId().ToString();
    public string Description { get; set; } = string.Empty;
}
