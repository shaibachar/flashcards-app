using Microsoft.AspNetCore.Mvc;

namespace FlashcardsApi.Controllers;

[ApiController]
[Route("api/learning-paths")]
public class LearningPathController : ControllerBase
{
    private readonly ILearningPathService _service;

    public LearningPathController(ILearningPathService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IEnumerable<LearningPath>> GetAll() =>
        await _service.GetAllAsync();

    [HttpPost]
    public async Task<IActionResult> Add(LearningPath path)
    {
        await _service.AddAsync(path);
        return Ok();
    }

    [HttpPut]
    public async Task<IActionResult> Update(LearningPath path)
    {
        await _service.UpdateAsync(path);
        return Ok();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        await _service.DeleteAsync(id);
        return Ok();
    }
    
    [HttpPost("seed")]
    public async Task<IActionResult> SeedFromJson()
    {
        var result = await _service.SeedFromJsonAsync();
        if (!result.Success)
            return BadRequest(result.Message);

        return Ok(result.Message);
    }
}
