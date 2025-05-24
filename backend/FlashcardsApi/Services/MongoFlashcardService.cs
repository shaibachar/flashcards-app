using FlashcardsApi.Models;
using MongoDB.Bson;
using MongoDB.Driver;

namespace FlashcardsApi.Services
{
    public class MongoFlashcardService : IFlashcardService
    {
        private readonly IMongoCollection<Flashcard> _flashcards;
        private readonly IMongoCollection<Deck> _decks;

        public MongoFlashcardService(string connectionString, string dbName)
        {
            var client = new MongoClient(connectionString);
            var database = client.GetDatabase(dbName);
            _flashcards = database.GetCollection<Flashcard>("flashcards");
            _decks = database.GetCollection<Deck>("decks");
        }

        public async Task IndexFlashcardAsync(Flashcard card)
        {
            await _flashcards.InsertOneAsync(card);
        }

        public async Task<IEnumerable<Flashcard>> GetRandomAsync(int count)
        {
            var pipeline = new[]
            {
                new BsonDocument { { "$sample", new BsonDocument { { "size", count } } } }
            };
            return await _flashcards.Aggregate<Flashcard>(pipeline).ToListAsync();
        }

        public async Task UpdateScoreAsync(string id, int score)
        {
            var filter = Builders<Flashcard>.Filter.Eq(f => f.Id, id);
            var update = Builders<Flashcard>.Update.Set(f => f.Score, score);
            await _flashcards.UpdateOneAsync(filter, update);
        }

        public async Task DeleteAsync(string id)
        {
            var filter = Builders<Flashcard>.Filter.Eq(f => f.Id, id);
            await _flashcards.DeleteOneAsync(filter);
        }

        public async Task<(bool, string)> SeedFromJsonAsync()
        {
            try
            {
                var path = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Resources", "flashcards.json");
                if (!File.Exists(path))
                    return (false, $"File not found: {path}");
                var json = await File.ReadAllTextAsync(path);
                var items = System.Text.Json.JsonSerializer.Deserialize<List<Flashcard>>(json, new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                if (items == null)
                    return (false, "Failed to deserialize flashcards");
                // Map JSON keys to C# properties if needed
                foreach (var item in items)
                {
                    if (!string.IsNullOrEmpty(item.Id) && item.Id.Length != 24)
                    {
                        // If the id is not a valid ObjectId, generate a new one
                        item.Id = ObjectId.GenerateNewId().ToString();
                    }
                }
                await _flashcards.DeleteManyAsync(_ => true); // Clear existing
                await _flashcards.InsertManyAsync(items);
                return (true, $"Seeded {items.Count} flashcards from JSON");
            }
            catch (Exception ex)
            {
                return (false, ex.Message);
            }
        }

        public async Task<IEnumerable<Flashcard>> GetRandomByDeckAsync(string deckId, int count)
        {
            var filter = Builders<Flashcard>.Filter.Eq(f => f.DeckId, deckId);
            var pipeline = new[]
            {
                new BsonDocument { { "$match", new BsonDocument { { "DeckId", deckId } } } },
                new BsonDocument { { "$sample", new BsonDocument { { "size", count } } } }
            };
            return await _flashcards.Aggregate<Flashcard>(pipeline).ToListAsync();
        }

        public async Task<IEnumerable<Deck>> GetAllDecksAsync()
        {
            // Collect all unique DeckId values from flashcards and return as Decks
            var deckIds = await _flashcards.Distinct<string>("DeckId", FilterDefinition<Flashcard>.Empty).ToListAsync();
            return deckIds
                .Where(id => !string.IsNullOrWhiteSpace(id))
                .Select(id => new Deck { Id = id, Description = $"Deck '{id}'" });
        }

        public IEnumerable<Flashcard> GetFlashcardsByDeck(string deckId)
        {
            return _flashcards.Find(f => f.DeckId == deckId).ToList();
        }

        public void Add(Flashcard flashcard)
        {
            _flashcards.InsertOne(flashcard);
        }

        public void UpdateScore(string id, int score)
        {
            var filter = Builders<Flashcard>.Filter.Eq(f => f.Id, id);
            var update = Builders<Flashcard>.Update.Set(f => f.Score, score);
            _flashcards.UpdateOne(filter, update);
        }
    }
}
