using FlashcardsApi.Models;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.IO;

namespace FlashcardsApi.Services
{
    public class UserService
    {
        private List<User> _users = new List<User>();
        private readonly string _filePath;

        public UserService()
        {
            _filePath = Path.Combine(AppContext.BaseDirectory, "Data", "users.json");

            // Load existing users if file exists
            if (File.Exists(_filePath))
            {
                try
                {
                    var json = File.ReadAllText(_filePath);
                    var loaded = JsonSerializer.Deserialize<List<User>>(json);
                    if (loaded != null)
                    {
                        _users.Clear();
                        _users.AddRange(loaded);
                    }
                }
                catch
                {
                    // ignore and start with empty list
                }
            }

            // Seed admin user if none exists
            if (!_users.Any())
            {
                var admin = new User
                {
                    Id = Guid.NewGuid().ToString(),
                    Username = "admin",
                    PasswordHash = HashPassword("admin123"),
                    Roles = new List<string> { UserRoles.Admin }
                };
                _users.Add(admin);
                Save();
            }
        }

        public IEnumerable<User> GetAll() => _users;
        public User GetById(string id) => _users.FirstOrDefault(u => u.Id == id);
        public User GetByUsername(string username) => _users.FirstOrDefault(u => u.Username == username);
        public void Add(User user)
        {
            _users.Add(user);
            Save();
        }
        public void Update(User user)
        {
            var idx = _users.FindIndex(u => u.Id == user.Id);
            if (idx >= 0) _users[idx] = user;
            Save();
        }
        public void Delete(string id)
        {
            _users.RemoveAll(u => u.Id == id);
            Save();
        }
        public bool ValidateCredentials(string username, string password)
        {
            var user = GetByUsername(username);
            return user != null && user.PasswordHash == HashPassword(password);
        }

        private void Save()
        {
            var dir = Path.GetDirectoryName(_filePath);
            if (!Directory.Exists(dir))
                Directory.CreateDirectory(dir!);

            var json = JsonSerializer.Serialize(_users, new JsonSerializerOptions { WriteIndented = true });
            File.WriteAllText(_filePath, json);
        }
        public static string HashPassword(string password)
        {
            using var sha = SHA256.Create();
            var bytes = sha.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(bytes);
        }
    }
}
