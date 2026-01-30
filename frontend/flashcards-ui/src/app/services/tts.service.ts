import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

const API_BASE_URL = environment.apiBaseUrl;

export interface Recording {
  id: string;
  filename: string;
  description: string;
  textContent: string;
  language: string;
  speed: number;
  voice: string;
  isPublic: boolean;
  userId: string;
  createdAt: string;
  fileSize: number;
  duration: number;
}

export interface CreateRecordingRequest {
  text?: string;
  file?: File;
  description: string;
  language: string;
  speed: number;
  voice: string;
  isPublic: boolean;
}

export interface UpdateRecordingRequest {
  description?: string;
  isPublic?: boolean;
}

@Injectable({ providedIn: 'root' })
export class TTSService {
  private baseUrl = `${API_BASE_URL}/tts`;
  
  constructor(private http: HttpClient) {}
  
  /**
   * Get list of supported languages
   */
  getSupportedLanguages(): Observable<{ [key: string]: string }> {
    return this.http.get<{ [key: string]: string }>(`${this.baseUrl}/languages`);
  }
  
  /**
   * Generate TTS recording from text or file
   */
  generateRecording(request: CreateRecordingRequest): Observable<Recording> {
    const formData = new FormData();
    
    if (request.text) {
      formData.append('text', request.text);
    }
    if (request.file) {
      formData.append('file', request.file);
    }
    formData.append('description', request.description);
    formData.append('language', request.language);
    formData.append('speed', request.speed.toString());
    formData.append('voice', request.voice);
    formData.append('is_public', request.isPublic.toString());
    
    return this.http.post<Recording>(`${this.baseUrl}/generate`, formData);
  }
  
  /**
   * Get all recordings (user's + public)
   */
  getRecordings(): Observable<Recording[]> {
    return this.http.get<Recording[]>(`${this.baseUrl}/recordings`);
  }
  
  /**
   * Download recording as MP3 file
   */
  downloadRecording(recordingId: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/recordings/${recordingId}/download`, {
      responseType: 'blob'
    });
  }
  
  /**
   * Get download URL for recording
   */
  getDownloadUrl(recordingId: string): string {
    return `${this.baseUrl}/recordings/${recordingId}/download`;
  }
  
  /**
   * Update recording metadata
   */
  updateRecording(recordingId: string, updates: UpdateRecordingRequest): Observable<Recording> {
    return this.http.put<Recording>(`${this.baseUrl}/recordings/${recordingId}`, updates);
  }
  
  /**
   * Delete recording
   */
  deleteRecording(recordingId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/recordings/${recordingId}`);
  }
  
  /**
   * Format duration in seconds to readable format (mm:ss)
   */
  formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
  
  /**
   * Format file size in bytes to readable format
   */
  formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
}
