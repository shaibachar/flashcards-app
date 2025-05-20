using Elasticsearch.Net;
using Nest;
namespace FlashcardsApi.Services;

public class ElasticsearchLearningPathService : ElasticServiceBase, ILearningPathService
{
    private const string IndexName = "learning-paths";

    public ElasticsearchLearningPathService(IConfiguration config)
        : base(config, IndexName) { }

    public async Task<IEnumerable<LearningPath>> GetAllAsync()
    {
        var response = await ElasticClient.SearchAsync<LearningPath>(s => s.Index(IndexName));
        return response.Documents;
    }

    public async Task<LearningPath?> GetByIdAsync(string id)
    {
        var response = await ElasticClient.GetAsync<LearningPath>(id, idx => idx.Index(IndexName));

        if (!response.Found)
            throw new KeyNotFoundException($"LearningPath with ID '{id}' not found.");

        return response.Source!;
    }

    public async Task AddAsync(LearningPath path)
    {
        await ElasticClient.IndexAsync(path, i => i.Index(IndexName).Id(path.Id));
    }

    public async Task UpdateAsync(LearningPath path)
    {
        await ElasticClient.IndexAsync(path, i => i.Index(IndexName).Id(path.Id));
    }

    public async Task DeleteAsync(string id)
    {
        await ElasticClient.DeleteAsync<LearningPath>(id, d => d.Index(IndexName));
    }

    public Task<(bool Success, string Message)> SeedFromJsonAsync()
    {
        throw new NotImplementedException();
    }
}
