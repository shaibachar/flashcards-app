using FlashcardsApi.Models;
using Nest;

namespace FlashcardsApi.Services;

public class FlashcardService : IFlashcardService
{
    private readonly IElasticClient _elastic;
    private const string IndexName = "flashcards";

    public FlashcardService(IConfiguration config)
    {
        var settings = new ConnectionSettings(new Uri(config["ELASTIC_URI"]))
            .DefaultIndex(IndexName);
        _elastic = new ElasticClient(settings);
    }

    public async Task IndexFlashcardAsync(Flashcard card)
    {
        await _elastic.IndexDocumentAsync(card);
    }

    public async Task<IEnumerable<Flashcard>> GetRandomAsync(int count)
    {
        // Get all flashcards
        var response = await _elastic.SearchAsync<Flashcard>(s => s
            .Size(1000) // cap max retrieved
            .Query(q => q.MatchAll()));

        if (!response.IsValid || response.Documents.Count == 0)
            return Enumerable.Empty<Flashcard>();

        // Shuffle client-side (simple alternative to random scoring)
        var shuffled = response.Documents.ToList()
            .OrderBy(x => Guid.NewGuid())
            .Take(count);

        return shuffled;
    }

    public async Task UpdateScoreAsync(string id, int newScore)
    {
        // Get document first
        var getResponse = await _elastic.GetAsync<Flashcard>(id);
        if (getResponse.Found)
        {
            var updated = getResponse.Source;
            updated.Score = newScore;

            await _elastic.IndexDocumentAsync(updated);
        }
    }

    public async Task DeleteAsync(string id)
    {
        await _elastic.DeleteAsync<Flashcard>(id);
    }
}
