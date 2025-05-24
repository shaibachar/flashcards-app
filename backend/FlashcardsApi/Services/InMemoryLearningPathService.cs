using System.Text.Json;

public class InMemoryLearningPathService : ILearningPathService
{
    private readonly List<LearningPath> _paths = new();

    public Task<IEnumerable<LearningPath>> GetAllAsync() =>
        Task.FromResult(_paths.AsEnumerable());

    public Task<LearningPath?> GetByIdAsync(string id) =>
       Task.FromResult(_paths.FirstOrDefault(p => p.Id == id));

    public Task AddAsync(LearningPath path)
    {
        _paths.Add(path);
        return Task.CompletedTask;
    }

    public Task UpdateAsync(LearningPath path)
    {
        var index = _paths.FindIndex(p => p.Id == path.Id);
        if (index != -1) _paths[index] = path;
        return Task.CompletedTask;
    }

    public Task DeleteAsync(string id)
    {
        _paths.RemoveAll(p => p.Id == id);
        return Task.CompletedTask;
    }

    public async Task<(bool Success, string Message)> SeedFromJsonAsync()
    {
        var path = Path.Combine(AppContext.BaseDirectory, "Resources", "learning-paths.json");
        if (!System.IO.File.Exists(path))
            return (false, "learning-paths.json not found");

        var json = await System.IO.File.ReadAllTextAsync(path);
        var options = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        };

        var paths = JsonSerializer.Deserialize<List<LearningPath>>(json, options);
        if (paths == null)
            return (false, "Invalid JSON content");

        foreach (var pathItem in paths)
        {
            if (string.IsNullOrWhiteSpace(pathItem.Id))
                pathItem.Id = Guid.NewGuid().ToString();

            _paths.Add(pathItem);  // assuming _paths is your in-memory list
        }

        return (true, $"{paths.Count} learning paths seeded.");
    }

}
