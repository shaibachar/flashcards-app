using Microsoft.AspNetCore.Mvc;
using FlashcardsApi.Models;
using FlashcardsApi.Services;
using Qdrant.Client;
using Newtonsoft.Json;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace FlashcardsApi.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class FlashcardBulkImportController : ControllerBase
    {
        private readonly FlashcardBulkImportService _importService;
        public FlashcardBulkImportController(FlashcardBulkImportService importService)
        {
            _importService = importService;
        }

        [HttpPost("upload-json")]
        public async Task<IActionResult> UploadJson([FromBody] List<Flashcard> flashcards)
        {
            if (flashcards == null || flashcards.Count == 0)
                return BadRequest("No flashcards provided");
            await _importService.BulkImportAsync(flashcards);
            return Ok(new { message = $"Imported {flashcards.Count} flashcards to Qdrant." });
        }
    }
}
