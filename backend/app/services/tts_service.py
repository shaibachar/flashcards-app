"""Text-to-Speech service using Google TTS (gTTS)."""

from __future__ import annotations
import os
import tempfile
import uuid
from typing import Optional, Tuple
from gtts import gTTS
from langdetect import detect, LangDetectException
from pydub import AudioSegment
import logging

logger = logging.getLogger(__name__)


class TTSService:
    """Service for converting text to speech and managing audio files."""
    
    # Supported gTTS languages (subset of most common ones)
    SUPPORTED_LANGUAGES = {
        'en': 'English',
        'es': 'Spanish',
        'fr': 'French',
        'de': 'German',
        'it': 'Italian',
        'pt': 'Portuguese',
        'ru': 'Russian',
        'ja': 'Japanese',
        'ko': 'Korean',
        'zh-cn': 'Chinese (Simplified)',
        'zh-tw': 'Chinese (Traditional)',
        'ar': 'Arabic',
        'hi': 'Hindi',
        'he': 'Hebrew',
        'nl': 'Dutch',
        'pl': 'Polish',
        'tr': 'Turkish',
        'sv': 'Swedish',
        'da': 'Danish',
        'no': 'Norwegian',
        'fi': 'Finnish'
    }
    
    def __init__(self, recordings_dir: str = "backend/recordings"):
        """
        Initialize TTS service.
        
        Args:
            recordings_dir: Directory to store generated MP3 files
        """
        self.recordings_dir = recordings_dir
        os.makedirs(recordings_dir, exist_ok=True)
    
    def detect_language(self, text: str) -> str:
        """
        Auto-detect language from text.
        
        Args:
            text: Text to analyze
            
        Returns:
            Language code (e.g., 'en', 'es') or 'en' as fallback
        """
        try:
            detected = detect(text)
            # Map some common language codes
            if detected in self.SUPPORTED_LANGUAGES:
                return detected
            # Handle Chinese
            if detected == 'zh':
                return 'zh-cn'
            return 'en'  # Fallback
        except LangDetectException:
            logger.warning(f"Could not detect language, using 'en' as default")
            return 'en'
    
    def generate_speech(
        self,
        text: str,
        language: str = 'auto',
        speed: float = 1.0,
        slow: bool = False
    ) -> Tuple[str, float, int]:
        """
        Generate MP3 file from text using gTTS.
        
        Args:
            text: Text to convert to speech
            language: Language code or 'auto' for auto-detection
            speed: Speed multiplier (0.5 - 2.0)
            slow: Use slower speech (gTTS built-in slow mode)
            
        Returns:
            Tuple of (filename, duration_seconds, file_size_bytes)
            
        Raises:
            ValueError: If parameters are invalid
            RuntimeError: If TTS generation fails
        """
        if not text or not text.strip():
            raise ValueError("Text cannot be empty")
        
        if speed < 0.5 or speed > 2.0:
            raise ValueError("Speed must be between 0.5 and 2.0")
        
        # Auto-detect language if needed
        if language == 'auto':
            language = self.detect_language(text)
        
        # Validate language
        if language not in self.SUPPORTED_LANGUAGES:
            logger.warning(f"Unsupported language '{language}', falling back to 'en'")
            language = 'en'
        
        try:
            # Generate unique filename
            filename = f"{uuid.uuid4()}.mp3"
            filepath = os.path.join(self.recordings_dir, filename)
            
            # Create TTS object
            tts = gTTS(text=text, lang=language, slow=slow)
            
            # Save initial MP3
            if speed == 1.0:
                # No speed adjustment needed
                tts.save(filepath)
            else:
                # Need to adjust speed using pydub
                with tempfile.NamedTemporaryFile(suffix='.mp3', delete=False) as temp_file:
                    temp_path = temp_file.name
                    tts.save(temp_path)
                
                # Load audio and adjust speed
                audio = AudioSegment.from_mp3(temp_path)
                
                # Change speed (without changing pitch)
                # Speed up or slow down by changing frame rate
                new_frame_rate = int(audio.frame_rate * speed)
                adjusted_audio = audio._spawn(audio.raw_data, overrides={
                    "frame_rate": new_frame_rate
                })
                adjusted_audio = adjusted_audio.set_frame_rate(audio.frame_rate)
                
                # Export adjusted audio
                adjusted_audio.export(filepath, format="mp3")
                
                # Clean up temp file
                try:
                    os.unlink(temp_path)
                except:
                    pass
            
            # Get file info
            file_size = os.path.getsize(filepath)
            
            # Calculate duration
            audio = AudioSegment.from_mp3(filepath)
            duration = len(audio) / 1000.0  # Convert ms to seconds
            
            logger.info(f"Generated TTS file: {filename} ({duration:.2f}s, {file_size} bytes)")
            
            return filename, duration, file_size
            
        except Exception as e:
            logger.error(f"Failed to generate TTS: {str(e)}")
            raise RuntimeError(f"TTS generation failed: {str(e)}")
    
    def get_file_path(self, filename: str) -> str:
        """
        Get absolute path to recording file.
        
        Args:
            filename: MP3 filename
            
        Returns:
            Absolute file path
        """
        return os.path.join(self.recordings_dir, filename)
    
    def delete_file(self, filename: str) -> bool:
        """
        Delete recording file from disk.
        
        Args:
            filename: MP3 filename
            
        Returns:
            True if deleted successfully, False otherwise
        """
        filepath = self.get_file_path(filename)
        try:
            if os.path.exists(filepath):
                os.unlink(filepath)
                logger.info(f"Deleted recording file: {filename}")
                return True
            return False
        except Exception as e:
            logger.error(f"Failed to delete file {filename}: {str(e)}")
            return False
    
    def file_exists(self, filename: str) -> bool:
        """
        Check if recording file exists.
        
        Args:
            filename: MP3 filename
            
        Returns:
            True if file exists, False otherwise
        """
        return os.path.exists(self.get_file_path(filename))
    
    @classmethod
    def get_supported_languages(cls) -> dict:
        """
        Get dictionary of supported languages.
        
        Returns:
            Dict mapping language codes to language names
        """
        return cls.SUPPORTED_LANGUAGES.copy()
