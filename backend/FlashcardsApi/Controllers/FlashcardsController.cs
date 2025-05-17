using Microsoft.AspNetCore.Mvc;
using FlashcardsApi.Models;
using FlashcardsApi.Services;
using System.Text.Json;

namespace FlashcardsApi.Controllers;

[ApiController]
[Route("[controller]")]
public class FlashcardsController : ControllerBase
{
    private readonly IFlashcardService _service;

    public FlashcardsController(IFlashcardService service)
    {
        _service = service;
    }

    [HttpPost]
    public async Task<IActionResult> Post([FromBody] Flashcard card)
    {
        await _service.IndexFlashcardAsync(card);
        return CreatedAtAction(nameof(Post), new { card.Id }, card);
    }

    [HttpGet("random")]
    public async Task<IEnumerable<Flashcard>> GetRandom([FromQuery] int count = 10) =>
        await _service.GetRandomAsync(count);

    [HttpPatch("{id}/score")]
    public async Task<IActionResult> UpdateScore(string id, [FromBody] int score)
    {
        await _service.UpdateScoreAsync(id, score);
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        await _service.DeleteAsync(id);
        return NoContent();
    }

    [HttpPost("seed")]
    public async Task<IActionResult> SeedFromJson()
    {
        var (success, message) = await _service.SeedFromJsonAsync();
        if (!success)
            return BadRequest(message);

        return Ok(new { Message = message });
    }

    [HttpGet("{deckId}/random")]
    public async Task<IEnumerable<Flashcard>> GetRandomByDeck(string deckId, [FromQuery] int count = 10)
    {
        return await _service.GetRandomByDeckAsync(deckId, count);
    }

    [HttpGet("/decks")]
    public async Task<IEnumerable<Deck>> GetAllDecks()
    {
        return await _service.GetAllDecksAsync();
    }


}
