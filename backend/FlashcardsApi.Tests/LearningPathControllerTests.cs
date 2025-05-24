using Xunit;
using Moq;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using FlashcardsApi.Controllers;
using FlashcardsApi.Models;
using FlashcardsApi.Services;

public class LearningPathControllerTests
{
    private readonly Mock<ILearningPathService> _mockService;
    private readonly LearningPathController _controller;

    public LearningPathControllerTests()
    {
        _mockService = new Mock<ILearningPathService>();
        _controller = new LearningPathController(_mockService.Object);
    }

    [Fact]
    public async Task GetAll_ReturnsOkWithPaths()
    {
        var paths = new List<LearningPath> { new LearningPath { Id = "1", Name = "Test", Description = "Test" } };
        _mockService.Setup(s => s.GetAllAsync()).ReturnsAsync(paths);

        var result = await _controller.GetAll();

        Assert.Equal(paths, result);
    }

    [Fact]
    public async Task Add_ValidPath_ReturnsOk()
    {
        var path = new LearningPath { Id = "1", Name = "Test", Description = "Test" };
        var result = await _controller.Add(path);

        _mockService.Verify(s => s.AddAsync(path), Times.Once);
        Assert.IsType<OkResult>(result);
    }

    [Fact]
    public async Task Update_ValidPath_ReturnsOk()
    {
        var path = new LearningPath { Id = "1", Name = "Updated", Description = "Updated" };
        var result = await _controller.Update(path);

        _mockService.Verify(s => s.UpdateAsync(path), Times.Once);
        Assert.IsType<OkResult>(result);
    }

    [Fact]
    public async Task Delete_ValidId_ReturnsOk()
    {
        var result = await _controller.Delete("1");

        _mockService.Verify(s => s.DeleteAsync("1"), Times.Once);
        Assert.IsType<OkResult>(result);
    }

    [Fact]
    public async Task SeedFromJson_Fails_ReturnsBadRequest()
    {
        _mockService.Setup(s => s.SeedFromJsonAsync()).ReturnsAsync((false, "File missing"));

        var result = await _controller.SeedFromJson();

        var badRequest = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Equal("File missing", badRequest.Value);
    }

    [Fact]
    public async Task SeedFromJson_Succeeds_ReturnsOk()
    {
        _mockService.Setup(s => s.SeedFromJsonAsync()).ReturnsAsync((true, "Seeded"));

        var result = await _controller.SeedFromJson();

        var ok = Assert.IsType<OkObjectResult>(result);
        Assert.Equal("Seeded", ok.Value);
    }
}
