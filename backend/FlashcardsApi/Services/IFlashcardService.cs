using FlashcardsApi.Models;

namespace FlashcardsApi.Services;

public interface IFlashcardService
{
    Task<IEnumerable<Flashcard>> GetAllAsync();

    Task UpdateAsync(Flashcard flashcard);

    Task IndexFlashcardAsync(Flashcard card);
    Task<IEnumerable<Flashcard>> GetRandomAsync(int count);
    Task UpdateScoreAsync(string id, int score);
    Task DeleteAsync(string id);
    Task<(bool Success, string Message)> SeedFromJsonAsync();

    Task<IEnumerable<Flashcard>> GetRandomByDeckAsync(string deckId, int count);

    Task<IEnumerable<Deck>> GetAllDecksAsync();

    IEnumerable<Flashcard> GetFlashcardsByDeck(string deckId);
    void Add(Flashcard flashcard);
    void UpdateScore(string id, int score);

    // Add topic to all relevant methods and comments if needed
    // For example, update Add, Update, and retrieval methods to handle topic
    // If you have DTOs or mapping, ensure topic is included
    // If you have search/filter by topic, add parameters as needed

    Task<IEnumerable<Flashcard>> QueryByVectorAsync(float[] vector, int count = 10);
    Task<IEnumerable<(Flashcard Card, float Score)>> QueryByVectorWithScoreAsync(float[] vector, int count = 10);
}
