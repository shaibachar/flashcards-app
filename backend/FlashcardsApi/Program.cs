using FlashcardsApi.Models;
using FlashcardsApi.Services;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

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

// Conditional service registration for local debugging
#if DEBUG
builder.Services.AddSingleton<IFlashcardService, InMemoryFlashcardService>();
#else
builder.Services.AddSingleton<IFlashcardService, FlashcardService>();
#endif

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
