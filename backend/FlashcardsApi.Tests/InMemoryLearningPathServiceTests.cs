using Xunit;
using FlashcardsApi.Models;
using FlashcardsApi.Services;
using System.Threading.Tasks;
using System.Linq;

public class InMemoryLearningPathServiceTests
{
    private readonly InMemoryLearningPathService _service;

    public InMemoryLearningPathServiceTests()
    {
        _service = new InMemoryLearningPathService();
    }

    [Fact]
    public async Task AddAndGetAll_Works()
    {
        var lp = new LearningPath { Id = "x", Name = "Test", Description = "D", CardIds = new() };
        await _service.AddAsync(lp);

        var all = await _service.GetAllAsync();
        Assert.Single(all);
    }

    [Fact]
    public async Task UpdateAsync_ChangesItem()
    {
        var lp = new LearningPath { Id = "x", Name = "Old", Description = "D" };
        await _service.AddAsync(lp);

        lp.Name = "Updated";
        await _service.UpdateAsync(lp);

        var updated = (await _service.GetAllAsync()).First();
        Assert.Equal("Updated", updated.Name);
    }

    [Fact]
    public async Task Delete_RemovesItem()
    {
        await _service.AddAsync(new LearningPath { Id = "to-del", Name = "Del", CardIds = new() });

        await _service.DeleteAsync("to-del");

        var all = await _service.GetAllAsync();
        Assert.Empty(all);
    }

   
}
