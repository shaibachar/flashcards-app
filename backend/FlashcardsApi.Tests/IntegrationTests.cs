using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Xunit;
using FlashcardsApi.Models;

public class CustomWebApplicationFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        builder.ConfigureAppConfiguration((context, config) =>
        {
            var settings = new Dictionary<string, string>
            {
                {"Storage:Provider", "InMemory"},
                {"OpenAI:ApiKey", "test-key"}
            };
            config.AddInMemoryCollection(settings);
        });
    }
}

public class IntegrationTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    public IntegrationTests(CustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task PostFlashcardAndRetrieve()
    {
        var card = new Flashcard { Question = "Q1", Answer = "A1", DeckId = "deck" };
        var response = await _client.PostAsJsonAsync("/flashcards", card);
        response.EnsureSuccessStatusCode();

        var getAll = await _client.GetAsync("/flashcards");
        getAll.EnsureSuccessStatusCode();
        var cards = await getAll.Content.ReadFromJsonAsync<List<Flashcard>>();
        Assert.Single(cards);
        Assert.Equal("Q1", cards[0].Question);
    }

    [Fact]
    public async Task AddLearningPathAndRetrieve()
    {
        var path = new LearningPath { Id = "1", Name = "Path", Description = "Desc", CardIds = new List<string>() };
        var resp = await _client.PostAsJsonAsync("/api/learning-paths", path);
        resp.EnsureSuccessStatusCode();

        var get = await _client.GetAsync("/api/learning-paths");
        get.EnsureSuccessStatusCode();
        var paths = await get.Content.ReadFromJsonAsync<List<LearningPath>>();
        Assert.Single(paths);
        Assert.Equal("Path", paths[0].Name);
    }
}
