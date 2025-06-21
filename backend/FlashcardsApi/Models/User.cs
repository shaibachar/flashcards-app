using System.Collections.Generic;

namespace FlashcardsApi.Models
{
    public class User
    {
        public string Id { get; set; }
        public string Username { get; set; }
        public string PasswordHash { get; set; }
        public List<string> Roles { get; set; } = new List<string>();
        public UserSettings Settings { get; set; } = new UserSettings();
    }

    public class UserSettings
    {
        public int FlashcardFontSize { get; set; } = 18;
    }
}
