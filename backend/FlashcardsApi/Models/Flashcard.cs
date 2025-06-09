using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace FlashcardsApi.Models;

public class Flashcard
{
    [BsonId]
    [BsonRepresentation(BsonType.String)]
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Question { get; set; } = string.Empty;
    public string Answer { get; set; } = string.Empty;
    public int Score { get; set; } = 0;
    public string DeckId { get; set; } = string.Empty;
    public string Explanation { get; set; } = string.Empty;
    public string Topic { get; set; } = string.Empty;
}
