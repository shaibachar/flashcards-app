using OpenAI;
using OpenAI.Chat;
using OpenAI.Models;
using FlashcardsApi.Models;
using Microsoft.Extensions.Logging;
using System.Text.Json;

namespace FlashcardsApi.Services;

public class FlashcardGeneratorService
{
    private readonly OpenAIClient _client;
    private readonly ILogger<FlashcardGeneratorService> _logger;

    public FlashcardGeneratorService(IConfiguration config, ILogger<FlashcardGeneratorService> logger)
    {
        var apiKey = config["OpenAI:ApiKey"] ?? throw new InvalidOperationException("Missing OpenAI API key in configuration.");
        _client = new OpenAIClient(new OpenAIAuthentication(apiKey));
        _logger = logger;
    }

    public async Task<List<Flashcard>> GenerateFlashcardsAsync(string topic)
    {
        _logger.LogInformation("Generating 2 flashcards for topic: {Topic}", topic);

        var systemPrompt = """
    You are a flashcard generator assistant.
    Return exactly 50 unique flashcards based on a given topic in valid JSON format.

    Each flashcard must contain:
    - question
    - answer
    - explanation

    Format the entire response as a JSON array:
    [
      {
        "question": "...",
        "answer": "...",
        "explanation": "..."
      }
    ]

    Do not include any text outside the JSON.
    """;

        var userPrompt = $"Generate 2 flashcards about the topic: \"{topic}\"";

        var chatRequest = new ChatRequest(
            messages: new List<Message>
            {
            new Message(Role.System, systemPrompt),
            new Message(Role.User, userPrompt)
            },
            model: Model.GPT3_5_Turbo
        );

        try
        {
            var result = await _client.ChatEndpoint.GetCompletionAsync(chatRequest);
            var raw = result.FirstChoice?.Message?.Content;

            if (string.IsNullOrWhiteSpace(raw))
                throw new InvalidOperationException("Empty response from OpenAI.");


            List<Flashcard>? cards = null;

            var options = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            };

            try
            {
                // Try to parse as-is (assumes raw JSON array)
                cards = JsonSerializer.Deserialize<List<Flashcard>>(raw, options);
            }
            catch (JsonException)
            {
                // Fallback: unwrap escaped JSON string
                var unescaped = JsonSerializer.Deserialize<string>(raw);
                cards = JsonSerializer.Deserialize<List<Flashcard>>(unescaped!, options);
            }

            if (cards == null || cards.Count == 0)
                throw new InvalidOperationException("No flashcards could be parsed from the response.");

            foreach (var card in cards)
            {
                card.Id = Guid.NewGuid().ToString();
                card.DeckId = "ai-generated";
                card.Score = 0;
            }

            return cards;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "OpenAI API call failed.");
            throw new InvalidOperationException("OpenAI API call failed.", ex);
        }
    }

}
