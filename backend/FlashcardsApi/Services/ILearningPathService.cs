public interface ILearningPathService
{
    Task<IEnumerable<LearningPath>> GetAllAsync();
    Task<LearningPath> GetByIdAsync(string id);
    Task AddAsync(LearningPath path);
    Task UpdateAsync(LearningPath path);
    Task DeleteAsync(string id);
    Task<(bool Success, string Message)> SeedFromJsonAsync();

}
