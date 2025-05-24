using FlashcardsApi.Models;
using FlashcardsApi.Services;
using Microsoft.OpenApi.Models;
using Nest;

var builder = WebApplication.CreateBuilder(args);

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

// Register Flashcard Service (use MongoDB)
var mongoConnectionString = Environment.GetEnvironmentVariable("MONGODB_CONNECTION_STRING") ?? builder.Configuration["MongoDB:ConnectionString"] ?? "mongodb://localhost:27017";
var mongoDbName = Environment.GetEnvironmentVariable("MONGODB_DATABASE") ?? builder.Configuration["MongoDB:Database"] ?? "flashcards";
builder.Services.AddSingleton<IFlashcardService>(sp => new MongoFlashcardService(mongoConnectionString, mongoDbName));

// Register Learning Path Service (use MongoDB)
builder.Services.AddSingleton<ILearningPathService>(sp => new MongoLearningPathService(mongoConnectionString, mongoDbName));


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
