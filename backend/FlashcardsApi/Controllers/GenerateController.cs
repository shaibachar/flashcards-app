using Microsoft.AspNetCore.Mvc;
using FlashcardsApi.Services;
using FlashcardsApi.Models;

[ApiController]
[Route("api/generate")]
public class GenerateController : ControllerBase
{
    private readonly FlashcardGeneratorService _generator;

    public GenerateController(FlashcardGeneratorService generator)
    {
        _generator = generator;
    }

    [HttpPost("flashcards")]
    public async Task<ActionResult<Flashcard>> Generate([FromBody] string topic)
    {
        if (string.IsNullOrWhiteSpace(topic))
            return BadRequest("Topic is required");

        var flashcard = await _generator.GenerateFlashcardsAsync(topic);
        return Ok(flashcard);
    }
}
