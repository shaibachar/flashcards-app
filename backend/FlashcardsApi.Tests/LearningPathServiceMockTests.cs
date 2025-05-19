using Xunit;
using Moq;
using System.Collections.Generic;
using System.Threading.Tasks;
using FlashcardsApi.Controllers;
using FlashcardsApi.Models;
using FlashcardsApi.Services;
using Microsoft.AspNetCore.Mvc;

public class LearningPathServiceMockTests
{
    private readonly Mock<ILearningPathService> _mockService;
    private readonly LearningPathController _controller;

    public LearningPathServiceMockTests()
    {
        _mockService = new Mock<ILearningPathService>();
        _controller = new LearningPathController(_mockService.Object);
    }

    [Fact]
    public async Task GetAll_ReturnsData()
    {
        var list = new List<LearningPath> { new LearningPath { Id = "1", Name = "Test", CardIds = new() } };
        _mockService.Setup(s => s.GetAllAsync()).ReturnsAsync(list);

        var result = await _controller.GetAll();

        Assert.Equal(list, result);
    }

    [Fact]
    public async Task Add_CallsServiceOnce()
    {
        var lp = new LearningPath { Id = "1", Name = "Test" };

        var result = await _controller.Add(lp);

        _mockService.Verify(s => s.AddAsync(lp), Times.Once);
        Assert.IsType<OkResult>(result);
    }

    [Fact]
    public async Task Update_CallsServiceOnce()
    {
        var lp = new LearningPath { Id = "1", Name = "Updated" };

        var result = await _controller.Update(lp);

        _mockService.Verify(s => s.UpdateAsync(lp), Times.Once);
        Assert.IsType<OkResult>(result);
    }

    [Fact]
    public async Task Delete_CallsServiceOnce()
    {
        var result = await _controller.Delete("1");

        _mockService.Verify(s => s.DeleteAsync("1"), Times.Once);
        Assert.IsType<OkResult>(result);
    }
}
