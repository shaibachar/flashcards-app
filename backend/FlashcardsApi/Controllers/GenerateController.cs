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

    [HttpPost("generate-summary")]
    public async Task<ActionResult<Flashcard>> GenerateSummary([FromBody] SummaryRequest input)
    {
        var prompt = $"""
        Based on the following flashcard questions, summarize the topic or concept they cover. 
        Return a concise explanation suitable for a flashcard answer:

        {string.Join("\n- ", input.Questions)}
    """;

        var summary = await _generator.GetSummaryAsync(prompt);
        var newCard = new Flashcard
        {
            Id = Guid.NewGuid().ToString(),
            Question = "Summary of recent topic",
            Answer = summary,
            Explanation = "",
            DeckId = "summary",
            Score = 0
        };

        //await _generator.IndexFlashcardAsync(newCard);
        return Ok(newCard);
    }

}
