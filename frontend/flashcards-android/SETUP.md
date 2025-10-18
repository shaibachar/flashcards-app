# Android Flashcards App - Setup Guide

## Prerequisites

1. **Install Android Studio**
   - Download from: https://developer.android.com/studio
   - Recommended: Android Studio Hedgehog (2023.1.1) or later

2. **Install JDK**
   - JDK 17 is required
   - Can be installed through Android Studio or separately

3. **Android SDK**
   - SDK 34 (Android 14) required
   - Install via Android Studio SDK Manager

## Setup Instructions

### 1. Open the Project

```bash
cd frontend/flashcards-android
```

Open this directory in Android Studio using **File > Open**

### 2. Configure local.properties

Create a `local.properties` file in the root of the android project:

```properties
sdk.dir=C\:\\Users\\YourUsername\\AppData\\Local\\Android\\Sdk
# Or on Mac/Linux:
# sdk.dir=/Users/YourUsername/Library/Android/sdk
```

### 3. API Configuration

The app is pre-configured to connect to:
- **Emulator**: `http://10.0.2.2:5000/api` (localhost on host machine)
- **Physical Device**: Update in `app/build.gradle.kts`:

```kotlin
buildConfigField("String", "API_BASE_URL", "\"http://YOUR_IP:5000/api\"")
```

To find your IP:
- Windows: `ipconfig`
- Mac/Linux: `ifconfig`

### 4. Sync Gradle

1. Click **Sync Project with Gradle Files** button (elephant icon)
2. Wait for dependencies to download
3. First sync may take several minutes

### 5. Build the App

```bash
# From terminal
./gradlew build

# Or use Android Studio's Build menu
Build > Make Project
```

### 6. Run the App

**Using Emulator:**
1. Create an emulator: **Tools > Device Manager**
2. Recommended: Pixel 6, API 34, Android 14
3. Click **Run** button (green triangle)

**Using Physical Device:**
1. Enable Developer Options on your device
2. Enable USB Debugging
3. Connect via USB
4. Select device from Run Configuration
5. Click **Run**

## Project Structure

```
app/src/main/
├── java/com/flashcards/app/
│   ├── FlashcardsApplication.kt       # Application entry point
│   ├── di/                            # Dependency Injection (Hilt)
│   │   ├── NetworkModule.kt           # Retrofit, OkHttp
│   │   ├── DatabaseModule.kt          # Room Database
│   │   └── DataStoreModule.kt         # SharedPreferences
│   ├── data/
│   │   ├── local/                     # Room entities, DAOs
│   │   ├── remote/                    # API services, DTOs
│   │   └── repository/                # Data repositories
│   ├── domain/
│   │   ├── model/                     # Domain models
│   │   │   ├── User.kt
│   │   │   ├── Deck.kt
│   │   │   ├── Flashcard.kt
│   │   │   └── LearningPath.kt
│   │   ├── repository/                # Repository interfaces
│   │   └── usecase/                   # Business logic
│   └── presentation/
│       ├── MainActivity.kt            # Main activity
│       ├── navigation/                # Navigation graph
│       │   ├── Screen.kt
│       │   └── FlashcardsNavGraph.kt
│       ├── theme/                     # Material Design theme
│       │   ├── Color.kt
│       │   ├── Type.kt
│       │   └── Theme.kt
│       ├── auth/                      # Login/Register screens
│       │   └── LoginScreen.kt
│       ├── home/                      # Home screen
│       │   └── HomeScreen.kt
│       ├── decks/                     # Deck management (TODO)
│       ├── flashcards/                # Flashcard CRUD (TODO)
│       ├── study/                     # Study mode (TODO)
│       └── learningpaths/             # Learning paths (TODO)
└── res/
    ├── values/
    │   ├── strings.xml                # String resources
    │   └── themes.xml                 # Theme config
    └── xml/
        ├── backup_rules.xml
        └── data_extraction_rules.xml
```

## What's Implemented

✅ **Project Setup**
- Gradle configuration with Kotlin DSL
- Jetpack Compose UI
- Hilt for dependency injection
- Retrofit for networking
- Room for local database (module ready)
- DataStore for preferences
- Material 3 theme

✅ **Navigation**
- Navigation component with Compose
- Route definitions for all screens
- Deep linking support ready

✅ **Screens**
- Login screen (UI only, needs API integration)
- Home screen with navigation cards

✅ **Domain Models**
- User, Deck, Flashcard, LearningPath

## What's Next (TODO)

### High Priority
1. **API Integration**
   - Create API service interfaces
   - Implement repositories
   - Add authentication interceptor
   - Handle JWT tokens

2. **Study Mode Screen**
   - Swipe gesture implementation (like web UI)
   - Flip card animation
   - Score tracking
   - Progress indicators

3. **Deck Management**
   - Deck list screen
   - Create/Edit deck
   - Delete deck

4. **Flashcard Management**
   - Flashcard list
   - Create/Edit flashcard
   - Image upload support

### Medium Priority
5. **Learning Paths**
   - Learning path list
   - Create/Edit learning path
   - Assign decks to paths

6. **Offline Support**
   - Room database implementation
   - Sync mechanism
   - Conflict resolution

7. **Settings**
   - Dark mode toggle
   - Notification preferences
   - Account settings

### Nice to Have
8. **Advanced Features**
   - Biometric authentication
   - Search & filter
   - Statistics dashboard
   - Share decks
   - Export/Import
   - Widgets
   - Background sync

## Development Tips

### Hot Reload
Jetpack Compose supports hot reload:
- Save file to see changes instantly
- No need to rebuild for UI changes

### Debugging
1. Use **Logcat** to view logs
2. Timber is configured for logging:
   ```kotlin
   Timber.d("Debug message")
   Timber.e("Error message")
   ```

### Testing
```bash
# Unit tests
./gradlew test

# UI tests
./gradlew connectedAndroidTest

# Specific test
./gradlew test --tests "com.flashcards.app.YourTest"
```

### Common Issues

**Gradle Sync Failed**
- Check internet connection
- Clear Gradle cache: `./gradlew clean`
- Invalidate caches: **File > Invalidate Caches / Restart**

**App Crashes on Start**
- Check Logcat for stack trace
- Verify API base URL is correct
- Ensure backend is running

**Cannot Connect to API**
- Emulator: Use `10.0.2.2` instead of `localhost`
- Physical device: Use your computer's IP address
- Check firewall settings
- Ensure backend is accessible from network

## Resources

- [Jetpack Compose Documentation](https://developer.android.com/jetpack/compose)
- [Material 3 Design](https://m3.material.io/)
- [Hilt Documentation](https://developer.android.com/training/dependency-injection/hilt-android)
- [Retrofit Documentation](https://square.github.io/retrofit/)
- [Room Database](https://developer.android.com/training/data-storage/room)

## Contributing

1. Create a feature branch
2. Follow Kotlin coding conventions
3. Write unit tests for business logic
4. Write UI tests for screens
5. Update this README if needed
6. Submit PR

## License

MIT License
