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
    static readonly HttpClient client = new HttpClient();
    static readonly string embeddingServerUrl = "http://10.0.0.19:8000";

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
    public async Task<ActionResult<IEnumerable<object>>> QueryByString([FromBody] QueryStringRequest req)
    {
        var vector = (await GetEmbedding(req.Query)).ToArray();
        var results = await _service.QueryByVectorWithScoreAsync(vector, req.Count);
        // Return both card and score
        return Ok(results.Select(r => new { card = r.Item1, score = r.Item2 }));
    }

    public class EmbeddingResponse
    {
        public List<List<float>> embeddings { get; set; } = new();
    }

    static async Task<List<float>> GetEmbedding(string sentence)
    {
        // Trim the input sentence
        sentence = sentence.Trim();
        var payload = new { sentences = new[] { sentence } };
        var json = System.Text.Json.JsonSerializer.Serialize(payload);

        var response = await client.PostAsync(
            $"{embeddingServerUrl}/embed",
            new StringContent(json, System.Text.Encoding.UTF8, "application/json"));

        response.EnsureSuccessStatusCode();
        var responseJson = await response.Content.ReadAsStringAsync();

        var result = System.Text.Json.JsonSerializer.Deserialize<EmbeddingResponse>(responseJson);
        if (result?.embeddings == null || result.embeddings.Count == 0)
            throw new Exception("No embedding returned from server");
        var embedding = result.embeddings.First();
        // Normalize the embedding vector
        var norm = MathF.Sqrt(embedding.Sum(x => x * x));
        if (norm > 0)
            embedding = embedding.Select(x => x / norm).ToList();
        return embedding;
    }
}
