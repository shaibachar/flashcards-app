using Elasticsearch.Net;
using Nest;
using Microsoft.Extensions.Configuration;

namespace FlashcardsApi.Services;

public abstract class ElasticServiceBase
{
    protected readonly IElasticClient ElasticClient;

    protected ElasticServiceBase(IConfiguration config, string indexName)
    {
        var elasticUri = config["ELASTIC_URI"] ?? throw new InvalidOperationException("Missing ELASTIC_URI in configuration.");
        var settings = new ConnectionSettings(new Uri(elasticUri))
            .DefaultIndex(indexName);

        ElasticClient = new ElasticClient(settings);
    }
}
