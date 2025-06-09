using System;
using System.Collections.Generic;
using System.IO;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Qdrant.Client;
using Qdrant.Client.Grpc;
using System.Linq;

class Flashcard
{
    public string Id { get; set; }
    public string Question { get; set; }
    public string Answer { get; set; }
    public int Score { get; set; }
    public string DeckId { get; set; }
    public string Explanation { get; set; }
    public string Topic { get; set; }
}

class EmbeddingResponse
{
    public List<List<float>> embeddings { get; set; }
}

class Program
{
    const string QdrantHost = "10.0.0.19";
    const int QdrantPort = 6334; // gRPC port
    const string CollectionName = "flashcards";
    const string EmbeddingServerUrl = "http://10.0.0.19:8000/embed";
    const string FlashcardsJsonPath = "./flashcards.json";

    static async Task Main()
    {
        var qdrant = new QdrantClient(QdrantHost, QdrantPort);
        Console.WriteLine($"Deleting collection '{CollectionName}' if exists...");
        try { await qdrant.DeleteCollectionAsync(CollectionName); } catch { }
        Console.WriteLine("Creating collection...");
        await qdrant.CreateCollectionAsync(CollectionName, new VectorParams { Size = 384, Distance = Distance.Cosine });

        Console.WriteLine("Loading flashcards from JSON...");
        var json = await File.ReadAllTextAsync(FlashcardsJsonPath);
        var jarr = JArray.Parse(json);
        var flashcards = new List<Flashcard>();
        foreach (var j in jarr)
        {
            // Use only valid UUIDs for Qdrant string IDs
            string rawId = j["_id"]?["$oid"]?.ToString();
            string id = Guid.TryParse(rawId, out var guid) ? guid.ToString() : Guid.NewGuid().ToString();
            flashcards.Add(new Flashcard
            {
                Id = id,
                Question = j["Question"]?.ToString(),
                Answer = j["Answer"]?.ToString(),
                Score = j["Score"] != null ? (int)j["Score"] : 0,
                DeckId = j["DeckId"]?.ToString(),
                Explanation = j["Explanation"]?.ToString(),
                Topic = j["topic"]?.ToString()
            });
        }

        // Instead of using Point and UpdateAsync, use PointStruct and UpsertAsync for both insert and update
        var points = new List<PointStruct>();
        Console.WriteLine($"Embedding and preparing {flashcards.Count} flashcards...");
        using var http = new HttpClient();
        int processed = 0;
        int total = flashcards.Count;
        int lastPercent = -1;
        foreach (var card in flashcards)
        {
            var embedding = await GetEmbedding(http, card.Question);
            var point = new PointStruct
            {
                Id = new PointId { Uuid = card.Id },
                Vectors = embedding.ToArray(),
            };
            point.Payload.Add("Question", new Qdrant.Client.Grpc.Value { StringValue = card.Question ?? string.Empty });
            point.Payload.Add("Answer", new Qdrant.Client.Grpc.Value { StringValue = card.Answer ?? string.Empty });
            point.Payload.Add("Score", new Qdrant.Client.Grpc.Value { IntegerValue = card.Score });
            point.Payload.Add("DeckId", new Qdrant.Client.Grpc.Value { StringValue = card.DeckId ?? string.Empty });
            point.Payload.Add("Explanation", new Qdrant.Client.Grpc.Value { StringValue = card.Explanation ?? string.Empty });
            point.Payload.Add("Topic", new Qdrant.Client.Grpc.Value { StringValue = card.Topic ?? string.Empty });
            points.Add(point);
            processed++;
            int percent = processed * 100 / total;
            if (percent != lastPercent)
            {
                Console.Write($"\rProgress: {processed}/{total} ({percent}%)");
                lastPercent = percent;
            }
        }
        Console.WriteLine();
        Console.WriteLine("Uploading to Qdrant...");
        await qdrant.UpsertAsync(CollectionName, points);
        Console.WriteLine("Done.");

        // Test: Query Qdrant with one of the questions and check score
        var testQuestion = flashcards[0].Question;
        var testEmbedding = (await GetEmbedding(http, testQuestion)).ToArray();
        var searchResult = await qdrant.SearchAsync(CollectionName, testEmbedding, limit: 1);
        if (searchResult.Count > 0)
        {
            var score = searchResult[0].Score;
            Console.WriteLine($"Test query score for '{testQuestion}': {score}");
            if (score > 0.99)
                Console.WriteLine("Test PASSED: Score is close to 1.");
            else
                Console.WriteLine("Test FAILED: Score is not close to 1.");
        }
        else
        {
            Console.WriteLine("Test FAILED: No results returned from Qdrant.");
        }
    }

    static async Task<List<float>> GetEmbedding(HttpClient http, string question)
    {
        var payload = new { sentences = new[] { question.Trim() } };
        var resp = await http.PostAsJsonAsync(EmbeddingServerUrl, payload);
        resp.EnsureSuccessStatusCode();
        var result = await resp.Content.ReadFromJsonAsync<EmbeddingResponse>();
        var embedding = result.embeddings[0];
        // Normalize
        var norm = MathF.Sqrt(embedding.Sum(x => x * x));
        if (norm > 0) embedding = embedding.Select(x => x / norm).ToList();
        return embedding;
    }
}
