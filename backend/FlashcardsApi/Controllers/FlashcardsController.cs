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
        var path = Path.Combine(AppContext.BaseDirectory, "Resources", "flashcards.json");
        if (!System.IO.File.Exists(path))
            return NotFound("flashcards.json not found");

        var json = await System.IO.File.ReadAllTextAsync(path);
        var cards = JsonSerializer.Deserialize<List<Flashcard>>(json);
        if (cards == null)
            return BadRequest("Invalid JSON content");

        foreach (var card in cards)
            await _service.IndexFlashcardAsync(card);

        return Ok(new { Message = $"{cards.Count} flashcards seeded." });
    }

}
