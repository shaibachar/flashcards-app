using FlashcardsApi.Models;
using Nest;
using System.Text.Json;

namespace FlashcardsApi.Services;

public class FlashcardService : ElasticServiceBase, IFlashcardService
{
    private const string IndexName = "flashcards";

    public FlashcardService(IConfiguration config)
         : base(config, IndexName) { }


    public async Task UpdateAsync(Flashcard card)
    {
        if (string.IsNullOrWhiteSpace(card.Id))
            throw new ArgumentException("Flashcard ID is required for update.");

        var response = await ElasticClient.UpdateAsync<Flashcard>(
            DocumentPath<Flashcard>.Id(card.Id),
            u => u.Index(IndexName).Doc(card)
        );

        if (!response.IsValid)
            throw new InvalidOperationException($"Failed to update flashcard {card.Id}: {response.ServerError?.Error?.Reason}");
    }

    public async Task<IEnumerable<Flashcard>> GetAllAsync()
    {
        var result = await ElasticClient.SearchAsync<Flashcard>(s => s
            .Index("flashcards")
            .Query(q => q.MatchAll())
            .Size(1000)
        );

        return result.Documents;
    }
    public async Task IndexFlashcardAsync(Flashcard card)
    {
        await ElasticClient.IndexDocumentAsync(card);
    }

    public async Task<IEnumerable<Flashcard>> GetRandomAsync(int count)
    {
        // Get all flashcards
        var response = await ElasticClient.SearchAsync<Flashcard>(s => s
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
        var getResponse = await ElasticClient.GetAsync<Flashcard>(id);
        if (getResponse.Found)
        {
            var updated = getResponse.Source;
            updated.Score = newScore;

            await ElasticClient.IndexDocumentAsync(updated);
        }
    }

    public async Task DeleteAsync(string id)
    {
        await ElasticClient.DeleteAsync<Flashcard>(id);
    }



    public async Task<(bool Success, string Message)> SeedFromJsonAsync()
    {
        var path = Path.Combine(AppContext.BaseDirectory, "Resources", "flashcards.json");
        if (!System.IO.File.Exists(path))
            return (false, "flashcards.json not found");

        var json = await System.IO.File.ReadAllTextAsync(path);
        var options = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        };

        var cards = JsonSerializer.Deserialize<List<Flashcard>>(json, options);
        if (cards == null)
            return (false, "Invalid JSON content");

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
        var response = await ElasticClient.SearchAsync<Flashcard>(s => s
            .Size(1000)
            .Query(q => q.Bool(b => b
                .Must(m => m.MatchAll())
                .Filter(f => f.Term(t => t.DeckId, deckId)))))
            ;

        if (!response.IsValid || response.Documents.Count == 0)
            return Enumerable.Empty<Flashcard>();

        var rng = new Random();
        return response.Documents.OrderBy(_ => rng.Next()).Take(count);
    }
    public async Task<IEnumerable<Deck>> GetAllDecksAsync()
    {
        var response = await ElasticClient.SearchAsync<Flashcard>(s => s
            .Size(1000) // adjust as needed
            .Query(q => q.MatchAll())
            .Source(sf => sf.Includes(i => i.Fields(f => f.DeckId))) // optimize
        );

        if (!response.IsValid || response.Documents.Count == 0)
            return Enumerable.Empty<Deck>();

        return response.Documents
            .Where(f => !string.IsNullOrWhiteSpace(f.DeckId))
            .GroupBy(f => f.DeckId)
            .Select(g => new Deck { Id = g.Key, Description = $"Deck '{g.Key}' ({g.Count()} cards)" });
    }


    public IEnumerable<Flashcard> GetFlashcardsByDeck(string deckId)
    {
        var result = ElasticClient.Search<Flashcard>(s => s
            .Index(IndexName)
            .Size(1000)
            .Query(q => q.Term(t => t.DeckId, deckId))
        );

        return result.Documents;
    }

    public void Add(Flashcard flashcard)
    {
        if (string.IsNullOrWhiteSpace(flashcard.Id))
            flashcard.Id = Guid.NewGuid().ToString();

        ElasticClient.Index(flashcard, i => i.Index(IndexName).Id(flashcard.Id));
    }

    public void UpdateScore(string id, int score)
    {

    }

    public Task<IEnumerable<Flashcard>> QueryByVectorAsync(float[] vector, int count = 10)
    {
        // Not supported for Elastic, return empty
        return Task.FromResult(Enumerable.Empty<Flashcard>());
    }

    public Task<IEnumerable<(Flashcard Card, float Score)>> QueryByVectorWithScoreAsync(float[] vector, int count = 10)
    {
        // Not supported for Elastic, return empty
        return Task.FromResult(Enumerable.Empty<(Flashcard, float)>());
    }

}
