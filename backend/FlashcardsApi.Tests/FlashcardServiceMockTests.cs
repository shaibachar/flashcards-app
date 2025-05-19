using Xunit;
using Moq;
using System.Collections.Generic;
using System.Threading.Tasks;
using FlashcardsApi.Controllers;
using FlashcardsApi.Models;
using FlashcardsApi.Services;
using Microsoft.AspNetCore.Mvc;

public class FlashcardServiceMockTests
{
    private readonly Mock<IFlashcardService> _mockService;
    private readonly FlashcardsController _controller;

    public FlashcardServiceMockTests()
    {
        _mockService = new Mock<IFlashcardService>();
        _controller = new FlashcardsController(_mockService.Object);
    }

}
