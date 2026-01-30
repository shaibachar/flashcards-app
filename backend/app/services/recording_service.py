"""Service for managing TTS recordings metadata."""

from __future__ import annotations
from typing import List, Optional
from ..models import Recording, UpdateRecordingRequest
import json
import os
import logging

logger = logging.getLogger(__name__)


class RecordingService:
    """Service for managing TTS recordings and their metadata."""
    
    def __init__(self, data_path: str = "backend/data/recordings.json"):
        """
        Initialize recording service.
        
        Args:
            data_path: Path to JSON file storing recordings metadata
        """
        self.data_path = data_path
        self._recordings: List[Recording] = []
        self._load()
    
    def _load(self):
        """Load recordings from JSON file."""
        if os.path.exists(self.data_path):
            try:
                with open(self.data_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    self._recordings = [Recording(**r) for r in data]
                logger.info(f"Loaded {len(self._recordings)} recordings from {self.data_path}")
            except Exception as e:
                logger.error(f"Failed to load recordings: {str(e)}")
                self._recordings = []
        else:
            logger.info("No existing recordings file found, starting fresh")
            self._recordings = []
    
    def _save(self):
        """Save recordings to JSON file."""
        try:
            os.makedirs(os.path.dirname(self.data_path), exist_ok=True)
            with open(self.data_path, "w", encoding="utf-8") as f:
                # Convert to dict for JSON serialization
                data = [r.dict(by_alias=True) for r in self._recordings]
                json.dump(data, f, indent=2, ensure_ascii=False)
            logger.info(f"Saved {len(self._recordings)} recordings to {self.data_path}")
        except Exception as e:
            logger.error(f"Failed to save recordings: {str(e)}")
            raise
    
    def get_all(
        self,
        user_id: Optional[str] = None,
        include_public: bool = True
    ) -> List[Recording]:
        """
        Get all recordings, optionally filtered by user and public status.
        
        Args:
            user_id: User ID to filter by (returns user's private + public recordings)
            include_public: Whether to include public recordings from other users
            
        Returns:
            List of recordings
        """
        if user_id is None:
            # No user context, return only public recordings
            return [r for r in self._recordings if r.is_public]
        
        # User context: return user's recordings + public recordings
        result = []
        for r in self._recordings:
            if r.user_id == user_id:
                # User's own recordings (both public and private)
                result.append(r)
            elif include_public and r.is_public:
                # Public recordings from other users
                result.append(r)
        
        return result
    
    def get_by_id(self, recording_id: str) -> Optional[Recording]:
        """
        Get recording by ID.
        
        Args:
            recording_id: Recording ID
            
        Returns:
            Recording if found, None otherwise
        """
        return next((r for r in self._recordings if r.id == recording_id), None)
    
    def create(self, recording: Recording) -> Recording:
        """
        Create a new recording.
        
        Args:
            recording: Recording object to create
            
        Returns:
            Created recording
        """
        self._recordings.append(recording)
        self._save()
        logger.info(f"Created recording {recording.id} by user {recording.user_id}")
        return recording
    
    def update(
        self,
        recording_id: str,
        updates: UpdateRecordingRequest,
        user_id: str
    ) -> Optional[Recording]:
        """
        Update recording metadata.
        
        Args:
            recording_id: Recording ID to update
            updates: Update request with new values
            user_id: User ID making the update (for authorization)
            
        Returns:
            Updated recording if successful, None if not found or unauthorized
        """
        recording = self.get_by_id(recording_id)
        if not recording:
            logger.warning(f"Recording {recording_id} not found")
            return None
        
        # Check authorization (user can only update their own recordings)
        if recording.user_id != user_id:
            logger.warning(f"User {user_id} unauthorized to update recording {recording_id}")
            return None
        
        # Apply updates
        if updates.description is not None:
            recording.description = updates.description
        if updates.is_public is not None:
            recording.is_public = updates.is_public
        
        self._save()
        logger.info(f"Updated recording {recording_id}")
        return recording
    
    def delete(self, recording_id: str, user_id: str) -> bool:
        """
        Delete a recording.
        
        Args:
            recording_id: Recording ID to delete
            user_id: User ID making the deletion (for authorization)
            
        Returns:
            True if deleted successfully, False otherwise
        """
        recording = self.get_by_id(recording_id)
        if not recording:
            logger.warning(f"Recording {recording_id} not found")
            return False
        
        # Check authorization (user can only delete their own recordings)
        if recording.user_id != user_id:
            logger.warning(f"User {user_id} unauthorized to delete recording {recording_id}")
            return False
        
        self._recordings = [r for r in self._recordings if r.id != recording_id]
        self._save()
        logger.info(f"Deleted recording {recording_id}")
        return True
    
    def can_access(self, recording_id: str, user_id: Optional[str] = None) -> bool:
        """
        Check if a user can access a recording.
        
        Args:
            recording_id: Recording ID
            user_id: User ID (None for anonymous access)
            
        Returns:
            True if user can access the recording, False otherwise
        """
        recording = self.get_by_id(recording_id)
        if not recording:
            return False
        
        # Public recordings can be accessed by anyone
        if recording.is_public:
            return True
        
        # Private recordings only by owner
        return user_id == recording.user_id
