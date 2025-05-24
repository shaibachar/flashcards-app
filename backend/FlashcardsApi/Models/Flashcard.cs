using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace FlashcardsApi.Models;

public class Flashcard
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = ObjectId.GenerateNewId().ToString();
    public string Question { get; set; } = string.Empty;
    public string Answer { get; set; } = string.Empty;
    public int Score { get; set; } = 0;
    public string DeckId { get; set; } = string.Empty;
    public string Explanation { get; set; } = string.Empty;
}
