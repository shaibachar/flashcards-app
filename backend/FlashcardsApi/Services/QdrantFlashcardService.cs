using FlashcardsApi.Models;
using Google.Protobuf.WellKnownTypes;
using Qdrant.Client;
using Qdrant.Client.Grpc;
using System.Text.Json;

namespace FlashcardsApi.Services
{
    public class QdrantFlashcardService : IFlashcardService
    {
        private readonly QdrantClient _client;
        private readonly string _collectionName = "flashcards";
        private readonly int _vectorSize = 384; // Adjust as needed

        public QdrantFlashcardService(string host, int port)
        {
            _client = new QdrantClient($"{host}:{port}");
        }

        public async Task<IEnumerable<Flashcard>> GetAllAsync()
        {
            var result = new List<Flashcard>();
            PointId? offset = null;
            const int limit = 1000;
            while (true)
            {
                var scrollRes = await _client.ScrollAsync(_collectionName, limit: limit, offset: offset);
                foreach (var point in scrollRes.Result)
                {
                    if (point.Payload != null && point.Payload.TryGetValue("json", out var jsonVal))
                    {
                        var card = JsonSerializer.Deserialize<Flashcard>(jsonVal.ToString());
                        if (card != null) result.Add(card);
                    }
                }
                if (scrollRes.Result.Count < limit) break;
                offset = scrollRes.NextPageOffset;
            }
            return result;
        }

        public async Task UpdateAsync(Flashcard flashcard)
        {
            await IndexFlashcardAsync(flashcard);
        }

        public async Task IndexFlashcardAsync(Flashcard card)
        {
            var vector = new float[_vectorSize];
            var point = new PointStruct
            {
                Id = new PointId { Uuid = card.Id },
                Vectors = vector,
                Payload = { ["json"] = JsonSerializer.Serialize(card) }
            };
            await _client.UpsertAsync(_collectionName, new List<PointStruct> { point });
        }

        public async Task<IEnumerable<Flashcard>> GetRandomAsync(int count)
        {
            var all = (await GetAllAsync()).ToList();
            var rng = new Random();
            return all.OrderBy(_ => rng.Next()).Take(count);
        }

        public async Task UpdateScoreAsync(string id, int score)
        {
            var all = await GetAllAsync();
            var card = all.FirstOrDefault(c => c.Id == id);
            if (card != null)
            {
                card.Score = score;
                await UpdateAsync(card);
            }
        }

        public async Task DeleteAsync(string id)
        {
            var filter = new Filter
            {
                Must = { new Condition
                    {
                        HasId = new HasIdCondition
                        {
                            HasId = { new PointId { Uuid = id } }
                        }
                    }
                }
            };
            await _client.DeleteAsync(_collectionName, filter);
        }

        public async Task<(bool Success, string Message)> SeedFromJsonAsync()
        {
            var path = Path.Combine(AppContext.BaseDirectory, "Resources", "flashcards.json");
            if (!System.IO.File.Exists(path))
                return (false, "flashcards.json not found");
            var json = await System.IO.File.ReadAllTextAsync(path);
            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            var cards = JsonSerializer.Deserialize<List<Flashcard>>(json, options);
            if (cards == null) return (false, "Invalid JSON content");
            foreach (var card in cards)
            {
                if (string.IsNullOrWhiteSpace(card.Id))
                    card.Id = Guid.NewGuid().ToString();
                await IndexFlashcardAsync(card);
            }
            return (true, $"{cards.Count} flashcards seeded.");
        }

        public async Task<IEnumerable<Flashcard>> GetRandomByDeckAsync(string deckId, int count)
        {
            var all = (await GetAllAsync()).Where(c => c.DeckId == deckId).ToList();
            var rng = new Random();
            return all.OrderBy(_ => rng.Next()).Take(count);
        }

        public async Task<IEnumerable<Deck>> GetAllDecksAsync()
        {
            var all = await GetAllAsync();
            return all.Where(f => !string.IsNullOrWhiteSpace(f.DeckId))
                .GroupBy(f => f.DeckId)
                .Select(g => new Deck { Id = g.Key, Description = $"Deck '{g.Key}' ({g.Count()} cards)" });
        }

        public IEnumerable<Flashcard> GetFlashcardsByDeck(string deckId)
        {
            return GetAllAsync().Result.Where(c => c.DeckId == deckId);
        }

        public void Add(Flashcard flashcard)
        {
            IndexFlashcardAsync(flashcard).Wait();
        }

        public void UpdateScore(string id, int score)
        {
            UpdateScoreAsync(id, score).Wait();
        }
    }
}
