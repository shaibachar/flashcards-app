using FlashcardsApi.Models;
using Qdrant.Client;
using Qdrant.Client.Grpc;
using Newtonsoft.Json.Linq;

namespace FlashcardsApi.Services
{
    public class FlashcardBulkImportService
    {
        private readonly QdrantClient _qdrant;
        private readonly string _collectionName = "flashcards";
        private readonly int _vectorSize = 384;
        private readonly string _embeddingServerUrl;

        public FlashcardBulkImportService(QdrantClient qdrant, string embeddingServerUrl)
        {
            _qdrant = qdrant;
            _embeddingServerUrl = embeddingServerUrl;
        }

        public async Task BulkImportAsync(IEnumerable<Flashcard> flashcards)
        {
            var points = new List<PointStruct>();
            using var http = new HttpClient();
            foreach (var card in flashcards)
            {
                var embedding = await GetEmbedding(http, card.Question ?? string.Empty);
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
            }
            await _qdrant.UpsertAsync(_collectionName, points);
        }

        private async Task<List<float>> GetEmbedding(HttpClient http, string question)
        {
            var payload = new { sentences = new[] { question?.Trim() ?? string.Empty } };
            var resp = await http.PostAsJsonAsync(_embeddingServerUrl, payload);
            resp.EnsureSuccessStatusCode();
            var result = await resp.Content.ReadFromJsonAsync<EmbeddingResponse>();
            var embedding = result?.embeddings?.FirstOrDefault() ?? new List<float>();
            var norm = MathF.Sqrt(embedding.Sum(x => x * x));
            if (norm > 0) embedding = embedding.Select(x => x / norm).ToList();
            return embedding;
        }

        private class EmbeddingResponse
        {
            public List<List<float>> embeddings { get; set; } = new();
        }
    }
}
