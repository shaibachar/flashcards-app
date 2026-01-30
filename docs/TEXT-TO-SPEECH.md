# Text-to-Speech Feature

## Overview
The Text-to-Speech (TTS) feature allows users to convert text content into MP3 audio files. Users can input text directly, upload text files, or upload PDF files to generate speech recordings.

## Features

### Audio Generation
- **Text Input**: Enter text directly in a multiline text box
- **File Upload**: Upload `.txt` or `.pdf` files (text is automatically extracted from PDFs)
- **Language Detection**: Auto-detect language or manually select from 20+ supported languages
- **Speed Control**: Adjust playback speed from 0.5x to 2.0x
- **Voice Options**: Default voice provided by Google TTS (gTTS)

### Recording Management
- **Public/Private**: Mark recordings as public or private
  - Private: Only visible to the creator
  - Public: Visible to all users
- **Description**: Add custom descriptions to recordings
- **Edit**: Update description and privacy settings after creation
- **Delete**: Remove recordings and associated audio files
- **Download**: Download recordings as MP3 files
- **Filter**: View all recordings, only yours, or only public recordings

### Recording Metadata
Each recording stores:
- Original text content (first 500 characters)
- Language used
- Speed multiplier
- File size
- Duration
- Creation timestamp
- Owner user ID
- Privacy status

## Backend Implementation

### Dependencies
Added to `requirements.txt`:
- `gTTS`: Google Text-to-Speech library
- `pypdf`: PDF text extraction
- `langdetect`: Language auto-detection
- `pydub`: Audio manipulation for speed adjustment

### Services

#### TTSService (`backend/app/services/tts_service.py`)
Handles text-to-speech conversion:
- `generate_speech()`: Convert text to MP3 with speed adjustment
- `detect_language()`: Auto-detect language from text
- `delete_file()`: Remove MP3 files
- Supports 20+ languages

#### RecordingService (`backend/app/services/recording_service.py`)
Manages recording metadata:
- CRUD operations for recordings
- User authorization checks
- Filter recordings by user/public status
- JSON-based storage in `backend/data/recordings.json`

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tts/languages` | Get supported languages |
| POST | `/tts/generate` | Generate TTS recording from text/file |
| GET | `/tts/recordings` | List user's + public recordings |
| GET | `/tts/recordings/{id}/download` | Download MP3 file |
| PUT | `/tts/recordings/{id}` | Update recording metadata |
| DELETE | `/tts/recordings/{id}` | Delete recording |

### Models
- `Recording`: Recording metadata model
- `CreateRecordingRequest`: Request model for generation
- `UpdateRecordingRequest`: Request model for updates

### Storage
- **Audio Files**: `backend/recordings/*.mp3`
- **Metadata**: `backend/data/recordings.json`

## Frontend Implementation

### Component
`TextToSpeechComponent` (`frontend/flashcards-ui/src/app/text-to-speech/`)

### Features
1. **Generation Form**
   - Multiline text input or file upload
   - Language selection with auto-detect
   - Speed slider (0.5x - 2.0x)
   - Public/private toggle
   - Description field

2. **Recordings List**
   - Sortable by creation date
   - Filter by all/mine/public
   - Inline editing of descriptions
   - Download button
   - Privacy toggle
   - Delete action

### Service
`TTSService` (`frontend/flashcards-ui/src/app/services/tts.service.ts`)
- API communication
- File download handling
- Utility functions for formatting duration and file size

### Routing
- Route: `/text-to-speech`
- Menu item: "Text to Speech" (available in main navigation)

### Translations
Supports English and Hebrew translations for all UI elements.

## Usage

### For Users
1. Navigate to "Text to Speech" from the menu
2. Either:
   - Enter text in the text box, OR
   - Upload a `.txt` or `.pdf` file
3. Optionally configure:
   - Description
   - Language (or use auto-detect)
   - Speed (0.5x - 2.0x)
   - Public/Private setting
4. Click "Generate"
5. View, download, edit, or delete recordings from the list

### For Developers

#### Install Backend Dependencies
```bash
cd backend
pip install -r requirements.txt
```

#### Backend Structure
```
backend/
├── app/
│   ├── services/
│   │   ├── tts_service.py          # TTS generation
│   │   └── recording_service.py    # Recording CRUD
│   ├── models.py                    # Recording models
│   └── routes.py                    # TTS API endpoints
├── data/
│   └── recordings.json              # Recording metadata
└── recordings/                      # MP3 files
    └── *.mp3
```

#### Frontend Structure
```
frontend/flashcards-ui/src/app/
├── text-to-speech/
│   ├── text-to-speech.component.ts
│   ├── text-to-speech.component.html
│   └── text-to-speech.component.css
└── services/
    └── tts.service.ts
```

## Supported Languages
- English (en)
- Spanish (es)
- French (fr)
- German (de)
- Italian (it)
- Portuguese (pt)
- Russian (ru)
- Japanese (ja)
- Korean (ko)
- Chinese Simplified (zh-cn)
- Chinese Traditional (zh-tw)
- Arabic (ar)
- Hindi (hi)
- Hebrew (he)
- Dutch (nl)
- Polish (pl)
- Turkish (tr)
- Swedish (sv)
- Danish (da)
- Norwegian (no)
- Finnish (fi)

## Technical Notes

### PDF Text Extraction
- Uses `pypdf` library
- Extracts text from all pages
- Handles multi-page documents

### Speed Adjustment
- Uses `pydub` to modify playback speed
- Preserves pitch while changing speed
- No quality loss

### Authentication
- Requires JWT token for private recordings
- Anonymous users can only view public recordings
- Users can only edit/delete their own recordings

### File Limits
- No hard file size limits (configurable if needed)
- Text truncated to 500 chars for metadata storage
- Full text used for audio generation

## Future Enhancements
- Multiple voice options
- Voice gender selection
- Custom pronunciation dictionaries
- Batch processing
- Audio waveform visualization
- Playback in browser (HTML5 audio player)
- Export recordings list
- Search/filter recordings by text content
