namespace FlashcardsApi.Models;

public class Flashcard
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Question { get; set; } = string.Empty;
    public string Answer { get; set; } = string.Empty;
    public int Score { get; set; } = 0;
    public string DeckId { get; set; } = string.Empty;
}
