using Elasticsearch.Net;
using Nest;
namespace FlashcardsApi.Services;
public class ElasticsearchLearningPathService : ILearningPathService
{
    private readonly IElasticClient _elastic;
    private const string IndexName = "learning-paths";

    public ElasticsearchLearningPathService(IConfiguration config)
    {
        var settings = new ConnectionSettings(new Uri(config["ELASTIC_URI"]))
            .DefaultIndex(IndexName);
        _elastic = new ElasticClient(settings);
    }


    public async Task<IEnumerable<LearningPath>> GetAllAsync()
    {
        var response = await _elastic.SearchAsync<LearningPath>(s => s
            .Index(IndexName)
            .Size(1000)
            .Query(q => q.MatchAll())
        );

        return response.Documents;
    }

    public async Task<LearningPath> GetByIdAsync(string id)
    {
        var response = await _elastic.GetAsync<LearningPath>(id, idx => idx.Index(IndexName));
        return response.Found ? response.Source : null;
    }

    public async Task AddAsync(LearningPath path)
    {
        await _elastic.IndexAsync(path, i => i.Index(IndexName).Id(path.Id));
    }

    public async Task UpdateAsync(LearningPath path)
    {
        await _elastic.IndexAsync(path, i => i.Index(IndexName).Id(path.Id));
    }

    public async Task DeleteAsync(string id)
    {
        await _elastic.DeleteAsync<LearningPath>(id, d => d.Index(IndexName));
    }

    public Task<(bool Success, string Message)> SeedFromJsonAsync()
    {
        throw new NotImplementedException();
    }
}
