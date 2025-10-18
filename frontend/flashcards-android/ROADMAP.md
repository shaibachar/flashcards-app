# Implementation Roadmap

## Phase 1: Core Infrastructure ✅
- [x] Project setup with Gradle
- [x] Jetpack Compose configuration
- [x] Hilt dependency injection
- [x] Navigation structure
- [x] Theme and design system
- [x] Domain models
- [x] Basic screens (Login, Home)

## Phase 2: Data Layer (In Progress)
### API Integration
- [ ] Create API service interfaces
  - [ ] AuthApi (login, register, logout)
  - [ ] DeckApi (CRUD operations)
  - [ ] FlashcardApi (CRUD operations)
  - [ ] LearningPathApi (CRUD operations)
  - [ ] UserApi (profile, settings)

- [ ] Create DTOs (Data Transfer Objects)
  - [ ] Map domain models to/from API models
  - [ ] Handle nullable fields

- [ ] Implement repositories
  - [ ] AuthRepository
  - [ ] DeckRepository
  - [ ] FlashcardRepository
  - [ ] LearningPathRepository
  - [ ] UserRepository

- [ ] Add authentication
  - [ ] JWT token storage (encrypted DataStore)
  - [ ] Auth interceptor for Retrofit
  - [ ] Token refresh mechanism
  - [ ] Logout cleanup

### Local Database
- [ ] Room database setup
  - [ ] FlashcardsDatabase class
  - [ ] Entity classes (cached data)
  - [ ] DAO interfaces
  - [ ] Type converters

- [ ] Offline support
  - [ ] Sync mechanism
  - [ ] Conflict resolution
  - [ ] Queue offline actions

## Phase 3: Presentation Layer - Authentication
- [ ] Login Screen
  - [x] UI design
  - [ ] ViewModel with state management
  - [ ] Form validation
  - [ ] Error handling
  - [ ] Loading states
  - [ ] Remember me functionality

- [ ] Register Screen
  - [ ] UI design
  - [ ] ViewModel
  - [ ] Form validation
  - [ ] Password strength indicator

## Phase 4: Presentation Layer - Decks
- [ ] Deck List Screen
  - [ ] UI with LazyColumn
  - [ ] ViewModel with Flow
  - [ ] Pull to refresh
  - [ ] Search functionality
  - [ ] Filter/sort options
  - [ ] Empty state
  - [ ] Error state

- [ ] Create/Edit Deck Screen
  - [ ] Form UI
  - [ ] ViewModel
  - [ ] Validation
  - [ ] Save/update operations
  - [ ] Image picker (optional)

- [ ] Deck Detail Screen
  - [ ] Display deck info
  - [ ] List flashcards
  - [ ] Start study button
  - [ ] Edit/delete actions

## Phase 5: Presentation Layer - Flashcards
- [ ] Flashcard Management Screen
  - [ ] List flashcards in deck
  - [ ] Add new flashcard FAB
  - [ ] Edit/delete actions
  - [ ] Reorder functionality

- [ ] Create/Edit Flashcard Screen
  - [ ] Question/Answer fields
  - [ ] Hint field
  - [ ] Difficulty selector
  - [ ] Tags input
  - [ ] Image upload
  - [ ] Save validation

## Phase 6: Presentation Layer - Study Mode ⭐
This is the core feature - implementing the swipe-based study interface from the web UI.

- [ ] Study Screen - Single Card View
  - [ ] Card flip animation
  - [ ] Question/Answer display
  - [ ] Flip button
  - [ ] Thumb up/down buttons
  - [ ] Score display

- [ ] Study Screen - Scroll View
  - [ ] Vertical scrolling with cards
  - [ ] Swipe gestures (left/right)
  - [ ] Velocity-based swipe detection
  - [ ] Visual feedback during swipe
  - [ ] Transform and opacity animations
  - [ ] Prevent scroll when swiping horizontally
  - [ ] Touch event handling
  - [ ] Score tracking
  - [ ] Progress indicator

- [ ] Study ViewModel
  - [ ] Load flashcards
  - [ ] Track progress
  - [ ] Score management
  - [ ] Shuffle option
  - [ ] Filter by difficulty

- [ ] Study Statistics
  - [ ] Session summary
  - [ ] Score breakdown
  - [ ] Time spent
  - [ ] Cards studied

## Phase 7: Presentation Layer - Learning Paths
- [ ] Learning Path List
  - [ ] Display all paths
  - [ ] Search/filter
  - [ ] Create new path

- [ ] Learning Path Detail
  - [ ] Show assigned decks
  - [ ] Progress tracking
  - [ ] Start study from path

- [ ] Create/Edit Learning Path
  - [ ] Basic info form
  - [ ] Deck selection
  - [ ] Order decks

## Phase 8: Settings & Profile
- [ ] Settings Screen
  - [ ] Dark mode toggle
  - [ ] Notification preferences
  - [ ] Study preferences
  - [ ] Account management
  - [ ] About section

- [ ] Profile Screen
  - [ ] User info
  - [ ] Statistics
  - [ ] Edit profile
  - [ ] Change password

## Phase 9: Advanced Features
- [ ] Search & Filter
  - [ ] Global search
  - [ ] Filter by tags
  - [ ] Filter by difficulty
  - [ ] Sort options

- [ ] Statistics Dashboard
  - [ ] Charts (Bar, Line, Pie)
  - [ ] Study streaks
  - [ ] Performance metrics
  - [ ] Progress over time

- [ ] Share & Export
  - [ ] Share decks with others
  - [ ] Export to JSON
  - [ ] Import from JSON
  - [ ] QR code sharing

- [ ] Biometric Authentication
  - [ ] Fingerprint/Face unlock
  - [ ] Secure token storage

- [ ] Notifications
  - [ ] Study reminders
  - [ ] Achievement notifications
  - [ ] Sync status

- [ ] Widgets
  - [ ] Quick study widget
  - [ ] Stats widget
  - [ ] Random flashcard widget

## Phase 10: Testing
- [ ] Unit Tests
  - [ ] ViewModels
  - [ ] Repositories
  - [ ] Use cases
  - [ ] Utilities

- [ ] UI Tests
  - [ ] Navigation flows
  - [ ] User interactions
  - [ ] Form validation
  - [ ] Error scenarios

- [ ] Integration Tests
  - [ ] API integration
  - [ ] Database operations
  - [ ] End-to-end flows

## Phase 11: Polish & Optimization
- [ ] Performance
  - [ ] LazyColumn optimization
  - [ ] Image caching
  - [ ] Memory leak checks
  - [ ] Battery optimization

- [ ] Accessibility
  - [ ] Screen reader support
  - [ ] Content descriptions
  - [ ] Touch target sizes (min 48dp)
  - [ ] Color contrast

- [ ] Animations
  - [ ] Screen transitions
  - [ ] Card flip animations
  - [ ] Swipe animations
  - [ ] Loading animations

- [ ] Error Handling
  - [ ] Network errors
  - [ ] API errors
  - [ ] Validation errors
  - [ ] Retry mechanisms

## Phase 12: Release Preparation
- [ ] App Icon & Splash Screen
- [ ] App Screenshots
- [ ] Privacy Policy
- [ ] Terms of Service
- [ ] Play Store Listing
- [ ] Proguard Rules Testing
- [ ] Release Build Testing
- [ ] Beta Testing Program

## Key Implementation Notes

### Study Mode Swipe Gestures
The study mode will replicate the web UI's swipe functionality:

1. **Gesture Detection**
   ```kotlin
   Modifier.pointerInput(Unit) {
       detectDragGestures { change, dragAmount ->
           // Calculate velocity
           // Update visual feedback
           // Determine swipe completion
       }
   }
   ```

2. **Visual Feedback**
   - Transform cards during swipe
   - Opacity changes
   - Color hints (green/red)

3. **Velocity Detection**
   - Fast flicks (>0.5 px/ms)
   - Slow drags (>70px threshold)

4. **Scroll vs Swipe**
   - Detect vertical vs horizontal intent early
   - Lock to one axis after threshold

### Offline-First Architecture
- Always read from local database
- Background sync to server
- Show cached data immediately
- Sync indicator in UI

### State Management
- Use StateFlow for ViewModels
- Compose State for UI
- Single source of truth
- Unidirectional data flow

## Estimated Timeline

- Phase 1: ✅ Complete
- Phase 2: 1 week
- Phase 3: 3 days
- Phase 4: 1 week
- Phase 5: 1 week
- Phase 6: 1.5 weeks (complex gestures)
- Phase 7: 1 week
- Phase 8: 3 days
- Phase 9: 2 weeks
- Phase 10: 1 week
- Phase 11: 1 week
- Phase 12: 3 days

**Total: ~10 weeks for full implementation**

## Priority Order for MVP

1. **Authentication** (Phase 3)
2. **API Integration** (Phase 2)
3. **Deck Management** (Phase 4)
4. **Flashcard Management** (Phase 5)
5. **Study Mode** (Phase 6) - Core feature
6. **Basic Settings** (Phase 8)

MVP can be delivered in ~5-6 weeks with these features.
