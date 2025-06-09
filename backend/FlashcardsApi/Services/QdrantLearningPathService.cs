using FlashcardsApi.Models;
using Qdrant.Client;
using Qdrant.Client.Grpc;
using System.Text.Json;

namespace FlashcardsApi.Services
{
    public class QdrantLearningPathService : ILearningPathService
    {
        private readonly QdrantClient _client;
        private readonly string _collectionName = "learning_paths";
        private readonly int _vectorSize = 64; // Adjust as needed

        public QdrantLearningPathService(string host, int port)
        {
            _client = new QdrantClient(host, port);
        }

        public async Task<IEnumerable<LearningPath>> GetAllAsync()
        {
            var result = new List<LearningPath>();
            PointId? offset = null;
            const int limit = 1000;
            while (true)
            {
                var scrollRes = await _client.ScrollAsync(_collectionName, limit: limit, offset: offset);
                foreach (var point in scrollRes.Result)
                {
                    if (point.Payload != null && point.Payload.TryGetValue("json", out var jsonVal))
                    {
                        var path = JsonSerializer.Deserialize<LearningPath>(jsonVal.ToString());
                        if (path != null) result.Add(path);
                    }
                }
                if (scrollRes.Result.Count < limit) break;
                offset = scrollRes.NextPageOffset;
            }
            return result;
        }

        public async Task AddAsync(LearningPath path)
        {
            var vector = new float[_vectorSize];
            var point = new PointStruct
            {
                Id = new PointId { Uuid = path.Id },
                Vectors = vector,
                Payload = { ["json"] = JsonSerializer.Serialize(path) }
            };
            await _client.UpsertAsync(_collectionName, new List<PointStruct> { point });
        }

        public async Task UpdateAsync(LearningPath path)
        {
            await AddAsync(path);
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

        public async Task<LearningPath?> GetByIdAsync(string id)
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
            var result = await _client.ScrollAsync(_collectionName, filter: filter, limit: 1);
            var point = result.Result.FirstOrDefault();
            if (point?.Payload != null && point.Payload.TryGetValue("json", out var jsonVal))
            {
                return JsonSerializer.Deserialize<LearningPath>(jsonVal.ToString());
            }
            return null;
        }

        public async Task<(bool Success, string Message)> SeedFromJsonAsync()
        {
            var path = Path.Combine(AppContext.BaseDirectory, "Resources", "learning-paths.json");
            if (!System.IO.File.Exists(path))
                return (false, "learning-paths.json not found");
            var json = await System.IO.File.ReadAllTextAsync(path);
            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            var paths = JsonSerializer.Deserialize<List<LearningPath>>(json, options);
            if (paths == null) return (false, "Invalid JSON content");
            foreach (var pathItem in paths)
            {
                if (string.IsNullOrWhiteSpace(pathItem.Id))
                    pathItem.Id = Guid.NewGuid().ToString();
                await AddAsync(pathItem);
            }
            return (true, $"{paths.Count} learning paths seeded.");
        }
    }
}
