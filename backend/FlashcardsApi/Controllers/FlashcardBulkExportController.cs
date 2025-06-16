using Microsoft.AspNetCore.Mvc;
using FlashcardsApi.Services;
using System.Text.Json;

namespace FlashcardsApi.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class FlashcardBulkExportController : ControllerBase
    {
        private readonly IFlashcardService _flashcardService;
        public FlashcardBulkExportController(IFlashcardService flashcardService)
        {
            _flashcardService = flashcardService;
        }

        [HttpGet("export-json")]
        public async Task<IActionResult> ExportJson()
        {
            // Fetch all flashcards from the DB
            var flashcards = await _flashcardService.GetAllAsync();

            // Normalize to a format suitable for import (match import endpoint expectations)
            var exportList = flashcards.Select(card => new {
                id = card.Id,
                question = card.Question,
                answer = card.Answer,
                explanation = card.Explanation,
                deckId = card.DeckId,
                score = card.Score,
                topic = card.Topic
            }).ToList();

            var json = System.Text.Json.JsonSerializer.Serialize(exportList, new System.Text.Json.JsonSerializerOptions { WriteIndented = true });
            var bytes = System.Text.Encoding.UTF8.GetBytes(json);
            return File(bytes, "application/json", $"flashcards-export-{DateTime.UtcNow:yyyyMMddHHmmss}.json");
        }
    }
}
