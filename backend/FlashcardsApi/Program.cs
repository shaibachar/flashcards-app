using FlashcardsApi.Models;
using FlashcardsApi.Services;
using Microsoft.OpenApi.Models;
using Nest;
using Qdrant.Client;


var builder = WebApplication.CreateBuilder(args);

var provider = builder.Configuration["Storage:Provider"] ?? "Mongo"; // Default to Mongo


// 🔐 Load configuration from user-secrets and environment variables
builder.Configuration
    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
    .AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", optional: true)
    .AddUserSecrets<Program>() // 👈 enables secrets stored securely for dev
    .AddEnvironmentVariables();

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Flashcards API", Version = "v1" });
});

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Register Flashcard Generator
builder.Services.AddSingleton<FlashcardGeneratorService>();

// Register openAIApi
var openAiApiKey = builder.Configuration["OpenAI:ApiKey"];
if (string.IsNullOrWhiteSpace(openAiApiKey))
{
    throw new InvalidOperationException("Missing OpenAI API Key in configuration.");
}
builder.Services.AddSingleton(new OpenAiConfig { ApiKey = openAiApiKey });


//TODO: make a better way to handle this
if (provider == "Mongo")
{
    var mongoConnectionString = Environment.GetEnvironmentVariable("MONGODB_CONNECTION_STRING") ?? builder.Configuration["MongoDB:ConnectionString"] ?? "mongodb://localhost:27017";
    var mongoDbName = Environment.GetEnvironmentVariable("MONGODB_DATABASE") ?? builder.Configuration["MongoDB:Database"] ?? "flashcards";

    // Register Flashcard Service (use MongoDB)
    builder.Services.AddSingleton<IFlashcardService>(sp => new MongoFlashcardService(mongoConnectionString, mongoDbName));

    // Register Learning Path Service (use MongoDB)
    builder.Services.AddSingleton<ILearningPathService>(sp => new MongoLearningPathService(mongoConnectionString, mongoDbName));

}
else if (provider == "InMemory")
{
    builder.Services.AddSingleton<IFlashcardService, InMemoryFlashcardService>();
    builder.Services.AddSingleton<ILearningPathService, InMemoryLearningPathService>();

}
else if (provider == "Qdrant")
{
    // Qdrant DB support via environment variables
    // Get Qdrant host/port from config or environment
    var qdrantHost = builder.Configuration["Qdrant:Host"] ?? Environment.GetEnvironmentVariable("QDRANT_HOST") ?? "10.0.0.16";
    var portStr = builder.Configuration["Qdrant:Port"] ?? Environment.GetEnvironmentVariable("QDRANT_PORT") ?? "6334";
    var qdrantPort = int.TryParse(portStr, out var p) ? p : 6334;

    builder.Services.AddSingleton<IFlashcardService>(sp => new QdrantFlashcardService(qdrantHost, qdrantPort));
    builder.Services.AddSingleton<ILearningPathService>(sp => new QdrantLearningPathService(qdrantHost, qdrantPort));
    // TODO: Add QdrantTopicService if needed

    // Register QdrantClient and FlashcardBulkImportService with host/port
    builder.Services.AddSingleton(new QdrantClient(qdrantHost, qdrantPort));
    builder.Services.AddSingleton<FlashcardBulkImportService>(sp =>
        new FlashcardBulkImportService(
            sp.GetRequiredService<QdrantClient>(),
            builder.Configuration["EmbeddingServer:Url"] ?? Environment.GetEnvironmentVariable("EMBEDDING_SERVER_URL") ?? "http://10.0.0.16:8000/embed"
        )
    );
}
else
{
    throw new InvalidOperationException("Invalid Storage.Provider setting in appsettings.json. Use 'Mongo', 'InMemory', or 'Qdrant'.");
}




var app = builder.Build();

// Configure middleware
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Flashcards API v1");
});

app.UseCors();
app.MapControllers();
app.Run();

// Optional: simple config model
public class OpenAiConfig
{
    public string ApiKey { get; set; } = string.Empty;
}
