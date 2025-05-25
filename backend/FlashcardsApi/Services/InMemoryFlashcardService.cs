using FlashcardsApi.Models;
using System.Text.Json;

namespace FlashcardsApi.Services;

public class InMemoryFlashcardService : IFlashcardService
{
    private readonly List<Flashcard> _store = new();

    public Task<IEnumerable<Flashcard>> GetAllAsync()
    {
        return Task.FromResult<IEnumerable<Flashcard>>(_store);
    }
    public Task UpdateAsync(Flashcard flashcard)
    {
        var index = _store.FindIndex(c => c.Id == flashcard.Id);
        if (index >= 0)
            _store[index] = flashcard;

        return Task.CompletedTask;
    }

    public Task IndexFlashcardAsync(Flashcard card)
    {
        _store.Add(card);
        return Task.CompletedTask;
    }

    public Task<IEnumerable<Flashcard>> GetRandomAsync(int count)
    {
        var rng = new Random();
        var result = _store.OrderBy(x => rng.Next()).Take(count);
        return Task.FromResult(result);
    }

    public Task UpdateScoreAsync(string id, int score)
    {
        var card = _store.FirstOrDefault(c => c.Id == id);
        if (card != null) card.Score = score;
        return Task.CompletedTask;
    }

    public Task DeleteAsync(string id)
    {
        _store.RemoveAll(c => c.Id == id);
        return Task.CompletedTask;
    }

    public IEnumerable<Flashcard> GetFlashcardsByDeck(string deckId) =>
        _store.Where(c => c.DeckId == deckId);

    public void Add(Flashcard card) => _store.Add(card);

    public void UpdateScore(string id, int score)
    {
        var card = _store.FirstOrDefault(c => c.Id == id);
        if (card != null)
            card.Score = score;
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

            _store.Add(card);
        }

        return (true, $"{cards.Count} flashcards seeded.");
    }
    public Task<IEnumerable<Flashcard>> GetRandomByDeckAsync(string deckId, int count)
    {
        var rng = new Random();
        var cards = _store.Where(c => c.DeckId == deckId).OrderBy(_ => rng.Next()).Take(count);
        return Task.FromResult(cards);
    }

    public Task<IEnumerable<Deck>> GetAllDecksAsync()
    {
        var result = _store
            .Where(c => !string.IsNullOrWhiteSpace(c.DeckId))
            .GroupBy(c => c.DeckId)
            .Select(g => new Deck { Id = g.Key, Description = $"Deck '{g.Key}' ({g.Count()} cards)" });

        return Task.FromResult(result);
    }


}
