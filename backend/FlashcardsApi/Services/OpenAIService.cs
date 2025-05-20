namespace FlashcardsApi.Services;

public class OpenAIService
{
    private readonly string _apiKey;

    public OpenAIService(IConfiguration configuration)
    {
        _apiKey = configuration["OpenAI:ApiKey"] ?? throw new InvalidOperationException("API key missing");
    }
}
