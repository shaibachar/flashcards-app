using Xunit;
using FlashcardsApi.Models;
using FlashcardsApi.Services;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

public class InMemoryFlashcardServiceTests
{
    private readonly InMemoryFlashcardService _service;

    public InMemoryFlashcardServiceTests()
    {
        _service = new InMemoryFlashcardService();
    }

    [Fact]
    public void Add_AddsFlashcard()
    {
        var card = new Flashcard { Id = "1", Question = "Q", Answer = "A", DeckId = "test", Score = 0 };
        _service.Add(card);

        var cards = _service.GetFlashcardsByDeck("test");
        Assert.Single(cards);
        Assert.Equal("Q", cards.First().Question);
    }

    [Fact]
    public void UpdateScore_UpdatesCorrectly()
    {
        var card = new Flashcard { Id = "1", Score = 0, DeckId = "d" };
        _service.Add(card);

        _service.UpdateScore("1", 5);

        var updated = _service.GetFlashcardsByDeck("d").First();
        Assert.Equal(5, updated.Score);
    }

   
}
