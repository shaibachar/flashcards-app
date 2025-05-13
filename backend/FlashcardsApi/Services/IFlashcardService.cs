using FlashcardsApi.Models;

namespace FlashcardsApi.Services;

public interface IFlashcardService
{
    Task IndexFlashcardAsync(Flashcard card);
    Task<IEnumerable<Flashcard>> GetRandomAsync(int count);
    Task UpdateScoreAsync(string id, int score);
    Task DeleteAsync(string id);
    Task<(bool Success, string Message)> SeedFromJsonAsync();

    Task<IEnumerable<Flashcard>> GetRandomByDeckAsync(string deckId, int count);

    Task<IEnumerable<Deck>> GetAllDecksAsync();

}
