using FlashcardsApi.Models;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;

namespace FlashcardsApi.Services
{
    public class UserService
    {
        private readonly List<User> _users = new List<User>();

        public UserService()
        {
            // Seed admin user if none exists
            if (!_users.Any())
            {
                var admin = new User
                {
                    Id = Guid.NewGuid().ToString(),
                    Username = "admin",
                    PasswordHash = HashPassword("admin123"),
                    Roles = new List<string> { "admin" }
                };
                _users.Add(admin);
            }
        }

        public IEnumerable<User> GetAll() => _users;
        public User GetById(string id) => _users.FirstOrDefault(u => u.Id == id);
        public User GetByUsername(string username) => _users.FirstOrDefault(u => u.Username == username);
        public void Add(User user) => _users.Add(user);
        public void Update(User user)
        {
            var idx = _users.FindIndex(u => u.Id == user.Id);
            if (idx >= 0) _users[idx] = user;
        }
        public void Delete(string id) => _users.RemoveAll(u => u.Id == id);
        public bool ValidateCredentials(string username, string password)
        {
            var user = GetByUsername(username);
            return user != null && user.PasswordHash == HashPassword(password);
        }
        public static string HashPassword(string password)
        {
            using var sha = SHA256.Create();
            var bytes = sha.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(bytes);
        }
    }
}
