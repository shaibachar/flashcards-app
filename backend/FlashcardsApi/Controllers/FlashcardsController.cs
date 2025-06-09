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

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Flashcard>>> GetAll()
    {
        var cards = await _service.GetAllAsync();
        return Ok(cards);
    }
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, [FromBody] Flashcard updated)
    {
        if (id != updated.Id)
            return BadRequest("Mismatched ID");

        await _service.UpdateAsync(updated);
        return NoContent();
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

    [HttpPost("query-vector")]
    public async Task<ActionResult<IEnumerable<Flashcard>>> QueryByVector([FromBody] float[] vector, [FromQuery] int count = 10)
    {
        var results = await _service.QueryByVectorAsync(vector, count);
        return Ok(results);
    }

    public class QueryStringRequest
    {
        public string Query { get; set; } = string.Empty;
        public int Count { get; set; } = 10;
    }

    [HttpPost("query-string")]
    public async Task<ActionResult<IEnumerable<Flashcard>>> QueryByString([FromBody] QueryStringRequest req)
    {
        // Call embedding server
        using var http = new HttpClient();
        var embeddingReq = new { sentences = new[] { req.Query } };
        var response = await http.PostAsync(
            "http://10.0.0.19:8000/embed",
            new StringContent(JsonSerializer.Serialize(embeddingReq), System.Text.Encoding.UTF8, "application/json")
        );
        if (!response.IsSuccessStatusCode)
            return StatusCode((int)response.StatusCode, "Embedding server error");
        using var stream = await response.Content.ReadAsStreamAsync();
        var embedResp = await JsonSerializer.DeserializeAsync<JsonElement>(stream);
        var vector = embedResp.GetProperty("embeddings")[0].EnumerateArray().Select(x => x.GetSingle()).ToArray();
        var results = await _service.QueryByVectorAsync(vector, req.Count);
        return Ok(results);
    }

}
