import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TTSService, Recording, CreateRecordingRequest } from '../services/tts.service';
import { TranslatePipe } from '../services/translate.pipe';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-text-to-speech',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './text-to-speech.component.html',
  styleUrls: ['./text-to-speech.component.css']
})
export class TextToSpeechComponent implements OnInit {
  // Form fields
  inputText = '';
  selectedFile: File | null = null;
  description = '';
  language = 'auto';
  speed = 1.0;
  voice = 'default';
  isPublic = false;
  
  // Recordings list
  recordings: Recording[] = [];
  filteredRecordings: Recording[] = [];
  filter: 'all' | 'mine' | 'public' = 'all';
  
  // Available languages
  supportedLanguages: { [key: string]: string } = {};
  languageKeys: string[] = [];
  
  // UI state
  isGenerating = false;
  errorMessage = '';
  successMessage = '';
  editingRecordingId: string | null = null;
  editDescription = '';
  
  constructor(
    private ttsService: TTSService,
    public auth: AuthService
  ) {}
  
  ngOnInit(): void {
    this.loadLanguages();
    this.loadRecordings();
  }
  
  loadLanguages() {
    this.ttsService.getSupportedLanguages().subscribe({
      next: (langs) => {
        this.supportedLanguages = langs;
        this.languageKeys = Object.keys(langs).sort();
      },
      error: (err) => {
        console.error('Failed to load languages:', err);
      }
    });
  }
  
  loadRecordings() {
    this.ttsService.getRecordings().subscribe({
      next: (recordings) => {
        this.recordings = recordings.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        this.applyFilter();
      },
      error: (err) => {
        console.error('Failed to load recordings:', err);
      }
    });
  }
  
  onFileSelected(event: any) {
    const file = event.target.files?.[0];
    if (file) {
      const filename = file.name.toLowerCase();
      if (filename.endsWith('.txt') || filename.endsWith('.pdf')) {
        this.selectedFile = file;
        this.errorMessage = '';
      } else {
        this.errorMessage = 'Please select a .txt or .pdf file';
        this.selectedFile = null;
        event.target.value = '';
      }
    }
  }
  
  clearFile() {
    this.selectedFile = null;
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }
  
  canGenerate(): boolean {
    return (this.inputText.trim().length > 0 || this.selectedFile !== null) && !this.isGenerating;
  }
  
  generate() {
    if (!this.canGenerate()) return;
    
    this.isGenerating = true;
    this.errorMessage = '';
    this.successMessage = '';
    
    const request: CreateRecordingRequest = {
      text: this.selectedFile ? undefined : this.inputText,
      file: this.selectedFile || undefined,
      description: this.description,
      language: this.language,
      speed: this.speed,
      voice: this.voice,
      isPublic: this.isPublic
    };
    
    this.ttsService.generateRecording(request).subscribe({
      next: (recording) => {
        this.successMessage = 'Recording generated successfully!';
        this.resetForm();
        this.loadRecordings();
        this.isGenerating = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.detail || 'Failed to generate recording';
        this.isGenerating = false;
      }
    });
  }
  
  resetForm() {
    this.inputText = '';
    this.selectedFile = null;
    this.description = '';
    this.language = 'auto';
    this.speed = 1.0;
    this.voice = 'default';
    this.isPublic = false;
    this.clearFile();
  }
  
  applyFilter() {
    const currentUserId = this.auth.getCurrentUser()?.id;
    
    if (this.filter === 'all') {
      this.filteredRecordings = this.recordings;
    } else if (this.filter === 'mine') {
      this.filteredRecordings = this.recordings.filter(r => r.userId === currentUserId);
    } else if (this.filter === 'public') {
      this.filteredRecordings = this.recordings.filter(r => r.isPublic && r.userId !== currentUserId);
    }
  }
  
  setFilter(filter: 'all' | 'mine' | 'public') {
    this.filter = filter;
    this.applyFilter();
  }
  
  download(recording: Recording) {
    const url = this.ttsService.getDownloadUrl(recording.id);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${recording.description || recording.id}.mp3`;
    link.click();
  }
  
  startEdit(recording: Recording) {
    this.editingRecordingId = recording.id;
    this.editDescription = recording.description;
  }
  
  cancelEdit() {
    this.editingRecordingId = null;
    this.editDescription = '';
  }
  
  saveEdit(recording: Recording) {
    if (this.editingRecordingId !== recording.id) return;
    
    this.ttsService.updateRecording(recording.id, {
      description: this.editDescription,
      isPublic: recording.isPublic
    }).subscribe({
      next: () => {
        this.cancelEdit();
        this.loadRecordings();
      },
      error: (err) => {
        this.errorMessage = 'Failed to update recording';
      }
    });
  }
  
  togglePublic(recording: Recording) {
    this.ttsService.updateRecording(recording.id, {
      isPublic: !recording.isPublic
    }).subscribe({
      next: () => {
        this.loadRecordings();
      },
      error: (err) => {
        this.errorMessage = 'Failed to update recording';
      }
    });
  }
  
  delete(recording: Recording) {
    if (!confirm(`Delete recording "${recording.description || recording.id}"?`)) {
      return;
    }
    
    this.ttsService.deleteRecording(recording.id).subscribe({
      next: () => {
        this.loadRecordings();
      },
      error: (err) => {
        this.errorMessage = 'Failed to delete recording';
      }
    });
  }
  
  isOwnRecording(recording: Recording): boolean {
    return recording.userId === this.auth.getCurrentUser()?.id;
  }
  
  formatDuration(seconds: number): string {
    return this.ttsService.formatDuration(seconds);
  }
  
  formatFileSize(bytes: number): string {
    return this.ttsService.formatFileSize(bytes);
  }
  
  formatDate(dateString: string): string {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  }
}
