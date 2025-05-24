using FlashcardsApi.Models;
using MongoDB.Bson;
using MongoDB.Driver;
using System.Text.Json;

namespace FlashcardsApi.Services
{
    public class MongoLearningPathService : ILearningPathService
    {
        private readonly IMongoCollection<LearningPath> _learningPaths;

        public MongoLearningPathService(string connectionString, string dbName)
        {
            var client = new MongoClient(connectionString);
            var database = client.GetDatabase(dbName);
            _learningPaths = database.GetCollection<LearningPath>("learningpaths");
        }

        public IEnumerable<LearningPath> GetAll()
        {
            return _learningPaths.Find(_ => true).ToList();
        }

        public LearningPath? GetById(string id)
        {
            return _learningPaths.Find(lp => lp.Id == id).FirstOrDefault();
        }

        public void Add(LearningPath learningPath)
        {
            _learningPaths.InsertOne(learningPath);
        }

        public void Update(LearningPath learningPath)
        {
            var filter = Builders<LearningPath>.Filter.Eq(lp => lp.Id, learningPath.Id);
            _learningPaths.ReplaceOne(filter, learningPath);
        }

        public void Delete(string id)
        {
            var filter = Builders<LearningPath>.Filter.Eq(lp => lp.Id, id);
            _learningPaths.DeleteOne(filter);
        }

        public async Task<IEnumerable<LearningPath>> GetAllAsync()
        {
            return await _learningPaths.Find(_ => true).ToListAsync();
        }

        public async Task<LearningPath?> GetByIdAsync(string id)
        {
            return await _learningPaths.Find(lp => lp.Id == id).FirstOrDefaultAsync();
        }

        public async Task AddAsync(LearningPath learningPath)
        {
            // Ensure Id is a valid ObjectId string
            if (string.IsNullOrEmpty(learningPath.Id) || learningPath.Id.Length != 24)
            {
                learningPath.Id = ObjectId.GenerateNewId().ToString();
            }
            await _learningPaths.InsertOneAsync(learningPath);
        }

        public async Task UpdateAsync(LearningPath learningPath)
        {
            var filter = Builders<LearningPath>.Filter.Eq(lp => lp.Id, learningPath.Id);
            await _learningPaths.ReplaceOneAsync(filter, learningPath);
        }

        public async Task DeleteAsync(string id)
        {
            var filter = Builders<LearningPath>.Filter.Eq(lp => lp.Id, id);
            await _learningPaths.DeleteOneAsync(filter);
        }

        public async Task<(bool Success, string Message)> SeedFromJsonAsync()
        {
            try
            {
                var path = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Resources", "learning-paths.json");
                if (!File.Exists(path))
                    return (false, $"File not found: {path}");
                var json = await File.ReadAllTextAsync(path);
                var items = System.Text.Json.JsonSerializer.Deserialize<List<LearningPath>>(json, new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                if (items == null)
                    return (false, "Failed to deserialize learning paths");
                foreach (var item in items)
                {
                    if (!string.IsNullOrEmpty(item.Id) && item.Id.Length != 24)
                    {
                        item.Id = ObjectId.GenerateNewId().ToString();
                    }
                }
                await _learningPaths.DeleteManyAsync(_ => true); // Clear existing
                await _learningPaths.InsertManyAsync(items);
                return (true, $"Seeded {items.Count} learning paths from JSON");
            }
            catch (Exception ex)
            {
                return (false, ex.Message);
            }
        }
    }
}
