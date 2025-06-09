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
            _client = new QdrantClient(host, port);
        }

        public async Task<IEnumerable<Flashcard>> GetAllAsync()
        {
            Console.WriteLine($"Fetching all flashcards from collection '{_collectionName}'");
            var result = new List<Flashcard>();
            PointId? offset = null;
            const int limit = 1000;
            while (true)
            {
                var scrollRes = await _client.ScrollAsync(_collectionName, limit: limit, offset: offset);
                Console.WriteLine($"Fetched {scrollRes.Result.Count} points, next offset: {scrollRes.NextPageOffset}");
                if (scrollRes.Result.Count == 0)
                {
                    Console.WriteLine("No more points to fetch.");
                    break;
                }
                foreach (var point in scrollRes.Result)
                {
                    var payload = point.Payload;
                    if (payload != null)
                    {
                        var card = new Flashcard
                        {
                            Id = point.Id.ToString(),
                            Question = payload.TryGetValue("Question", out var q) ? q.StringValue : string.Empty,
                            Answer = payload.TryGetValue("Answer", out var a) ? a.StringValue : string.Empty,
                            DeckId = payload.TryGetValue("DeckId", out var d) ? d.StringValue : string.Empty,
                            Explanation = payload.TryGetValue("Explanation", out var e) ? e.StringValue : string.Empty,
                            Score = payload.TryGetValue("Score", out var s) ? (int)(s.IntegerValue) : 0,
                            // Add more fields if needed
                        };
                        result.Add(card);
                    }
                    else
                    {
                        Console.WriteLine("No payload in point.");
                    }
                }
                if (scrollRes.Result.Count < limit) break;
                offset = scrollRes.NextPageOffset;
            }
            return result;
        }

        public async Task UpdateAsync(Flashcard flashcard)
        {
            // Ensure the ID is a valid UUID string for Qdrant
            if (!Guid.TryParse(flashcard.Id, out var uuid))
            {
                throw new ArgumentException($"Flashcard ID is not a valid UUID: {flashcard.Id}");
            }
            await IndexFlashcardAsync(flashcard);
        }

        public async Task IndexFlashcardAsync(Flashcard card)
        {
            // Ensure the ID is a valid UUID string for Qdrant
            if (!Guid.TryParse(card.Id, out var uuid))
            {
                throw new ArgumentException($"Flashcard ID is not a valid UUID: {card.Id}");
            }
            var vector = new float[_vectorSize];
            var point = new PointStruct
            {
                Id = new PointId { Uuid = uuid.ToString() },
                Vectors = vector,
                Payload = { ["Question"] = card.Question, ["Answer"] = card.Answer, ["Score"] = card.Score, ["DeckId"] = card.DeckId, ["Explanation"] = card.Explanation, ["Topic"] = card.Topic }
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

        public async Task<IEnumerable<Flashcard>> QueryByVectorAsync(float[] vector, int count = 10)
        {
            var searchRes = await _client.SearchAsync(_collectionName, vector, limit: (uint)count);
            var result = new List<Flashcard>();
            foreach (var point in searchRes)
            {
                var payload = point.Payload;
                if (payload != null)
                {
                    var card = new Flashcard
                    {
                        Id = point.Id.ToString(),
                        Question = payload.TryGetValue("Question", out var q) ? q.StringValue : string.Empty,
                        Answer = payload.TryGetValue("Answer", out var a) ? a.StringValue : string.Empty,
                        DeckId = payload.TryGetValue("DeckId", out var d) ? d.StringValue : string.Empty,
                        Explanation = payload.TryGetValue("Explanation", out var e) ? e.StringValue : string.Empty,
                        Score = payload.TryGetValue("Score", out var s) ? (int)(s.IntegerValue) : 0,
                    };
                    result.Add(card);
                }
            }
            return result;
        }

        public async Task<IEnumerable<(Flashcard Card, float Score)>> QueryByVectorWithScoreAsync(float[] vector, int count = 10)
        {
            var searchRes = await _client.SearchAsync(_collectionName, vector, limit: (uint)(count * 3)); // fetch more to allow filtering
            var result = new List<(Flashcard, float)>();
            foreach (var point in searchRes)
            {
                var payload = point.Payload;
                if (payload != null)
                {
                    var card = new Flashcard
                    {
                        Id = point.Id.ToString(),
                        Question = payload.TryGetValue("Question", out var q) ? q.StringValue : string.Empty,
                        Answer = payload.TryGetValue("Answer", out var a) ? a.StringValue : string.Empty,
                        DeckId = payload.TryGetValue("DeckId", out var d) ? d.StringValue : string.Empty,
                        Explanation = payload.TryGetValue("Explanation", out var e) ? e.StringValue : string.Empty,
                        Score = payload.TryGetValue("Score", out var s) ? (int)(s.IntegerValue) : 0,
                    };
                    result.Add((card, point.Score));
                }
            }
            // Order by Flashcard.Score (descending), then by vector similarity score (descending), and return only the top 'count' results
            return result.OrderByDescending(r => r.Item1.Score).ThenByDescending(r => r.Item2).Take(count);
        }
    }
}
