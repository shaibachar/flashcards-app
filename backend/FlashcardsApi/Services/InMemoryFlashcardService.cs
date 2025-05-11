using FlashcardsApi.Models;

namespace FlashcardsApi.Services;
public class InMemoryFlashcardService : IFlashcardService
{
    private readonly List<Flashcard> _store = new();

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
}
