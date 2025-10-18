# Flashcards Android App

Native Android application built with Jetpack Compose, implementing all features from the web UI.

## Tech Stack

- **Language:** Kotlin
- **UI Framework:** Jetpack Compose
- **Architecture:** MVVM + Clean Architecture
- **Dependency Injection:** Hilt
- **Networking:** Retrofit + OkHttp
- **Async:** Coroutines + Flow
- **Local Storage:** Room Database + DataStore
- **Image Loading:** Coil
- **Navigation:** Compose Navigation
- **Testing:** JUnit5, Mockk, Compose Testing

## Project Structure

```
app/
├── src/
│   ├── main/
│   │   ├── java/com/flashcards/
│   │   │   ├── data/
│   │   │   │   ├── local/
│   │   │   │   │   ├── dao/
│   │   │   │   │   ├── entities/
│   │   │   │   │   └── database/
│   │   │   │   ├── remote/
│   │   │   │   │   ├── api/
│   │   │   │   │   ├── dto/
│   │   │   │   │   └── interceptors/
│   │   │   │   └── repository/
│   │   │   ├── domain/
│   │   │   │   ├── model/
│   │   │   │   ├── repository/
│   │   │   │   └── usecase/
│   │   │   ├── presentation/
│   │   │   │   ├── auth/
│   │   │   │   ├── home/
│   │   │   │   ├── decks/
│   │   │   │   ├── flashcards/
│   │   │   │   ├── study/
│   │   │   │   ├── learningpaths/
│   │   │   │   ├── settings/
│   │   │   │   └── navigation/
│   │   │   ├── di/
│   │   │   └── util/
│   │   ├── res/
│   │   └── AndroidManifest.xml
│   ├── test/
│   └── androidTest/
├── build.gradle.kts
└── proguard-rules.pro
```

## Features

### Implemented
- [ ] Authentication (Login/Logout)
- [ ] Deck Management (CRUD)
- [ ] Flashcard Management (CRUD)
- [ ] Study Mode with Swipe Gestures
- [ ] Learning Paths
- [ ] User Settings
- [ ] Offline Support
- [ ] Image Support
- [ ] Voice Synthesis
- [ ] Search & Filter
- [ ] Statistics & Progress Tracking

### Mobile-Specific Features
- [ ] Biometric Authentication
- [ ] Dark Mode
- [ ] Gesture Navigation
- [ ] Widget Support
- [ ] Notifications
- [ ] Background Sync
- [ ] Share Decks
- [ ] Export/Import

## Getting Started

### Prerequisites

- Android Studio Hedgehog (2023.1.1) or later
- JDK 17 or later
- Android SDK 34
- Kotlin 1.9.0+

### Setup

1. Clone the repository
2. Open the project in Android Studio
3. Configure `local.properties`:
```properties
sdk.dir=/path/to/Android/sdk
api.base.url=http://10.0.2.2:5000/api
```

4. Sync Gradle files
5. Run the app

### Build Variants

- **debug** - Development build with logging
- **release** - Production build, optimized and obfuscated

### Running Tests

```bash
# Unit tests
./gradlew test

# Instrumented tests
./gradlew connectedAndroidTest

# Test coverage
./gradlew jacocoTestReport
```

## API Configuration

The app connects to the FastAPI backend. Update the base URL in `build.gradle.kts`:

```kotlin
buildConfigField("String", "API_BASE_URL", "\"http://localhost:5000/api\"")
```

For emulator: Use `10.0.2.2` instead of `localhost`
For physical device: Use your computer's IP address

## Architecture

### MVVM + Clean Architecture

```
Presentation Layer (UI)
    ↓
Domain Layer (Use Cases)
    ↓
Data Layer (Repository)
    ↓
Data Sources (API + Database)
```

### Key Components

**ViewModel:** Handles UI state and business logic
**Repository:** Coordinates data from multiple sources
**Use Cases:** Encapsulates business rules
**Composables:** UI components

## Dependencies

See `build.gradle.kts` for complete list:

- Jetpack Compose
- Hilt for DI
- Retrofit for networking
- Room for local database
- Coil for image loading
- Accompanist for additional Compose utilities

## Design System

Following Material 3 design guidelines with custom theme:

- **Primary Color:** #1976d2 (Blue)
- **Secondary Color:** #388e3c (Green)
- **Typography:** Roboto
- **Shape:** Rounded corners (8dp)

## Offline Support

- Local caching of flashcards and decks
- Sync when network available
- Queue user actions offline
- Conflict resolution strategy

## Security

- JWT token storage in encrypted DataStore
- Certificate pinning for API calls
- Obfuscated release builds
- Biometric authentication option

## Performance Optimizations

- Lazy loading of images
- Pagination for large lists
- Memory leak prevention
- Efficient recomposition
- Background threading

## Contributing

1. Create a feature branch
2. Follow Kotlin coding conventions
3. Write unit tests
4. Update documentation
5. Submit PR

## License

MIT License - See LICENSE file

## Contact

For issues or questions, please open a GitHub issue.
