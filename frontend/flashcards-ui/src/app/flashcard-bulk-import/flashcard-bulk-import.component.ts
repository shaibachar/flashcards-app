import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FlashcardBulkExportService } from './flashcard-bulk-export.service';
import { MenuComponent } from '../menu/menu.component';
import { FormsModule } from '@angular/forms';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-flashcard-bulk-import',
  standalone: true,
  imports: [CommonModule, MenuComponent, FormsModule],
  templateUrl: './flashcard-bulk-import.component.html',
  styleUrls: ['./flashcard-bulk-import.component.css']
})
export class FlashcardBulkImportComponent {
  uploadResult: string = '';
  loading = false;
  importedFlashcards: any[] = [];
  approvedFlashcards: boolean[] = [];
  editingIndex: number | null = null;
  editedCard: any = null;

  constructor(private http: HttpClient, private exportService: FlashcardBulkExportService) {}

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        try {
          const json = JSON.parse(e.target.result);
          if (Array.isArray(json)) {
            this.importedFlashcards = json;
            this.approvedFlashcards = new Array(json.length).fill(false);
            this.uploadResult = '';
          } else {
            this.uploadResult = 'JSON must be an array of flashcards.';
          }
        } catch (err) {
          this.uploadResult = 'Invalid JSON file.';
        }
      };
      reader.readAsText(file);
    }
  }

  approveCard(idx: number) {
    this.approvedFlashcards[idx] = true;
  }

  editCard(idx: number) {
    this.editingIndex = idx;
    this.editedCard = { ...this.importedFlashcards[idx] };
  }

  saveEdit(idx: number) {
    this.importedFlashcards[idx] = { ...this.editedCard };
    this.editingIndex = null;
    this.editedCard = null;
  }

  cancelEdit() {
    this.editingIndex = null;
    this.editedCard = null;
  }

  saveAll() {
    const toSave = this.importedFlashcards.filter((_, idx) => this.approvedFlashcards[idx]);
    if (toSave.length === 0) {
      this.uploadResult = 'No cards approved for import.';
      return;
    }
    this.loading = true;
    this.uploadResult = '';
    this.http.post(`${environment.apiBaseUrl}/flashcardbulkimport/upload-json`, toSave).subscribe({
      next: (res: any) => {
        this.uploadResult = res?.message || 'Import successful!';
        this.loading = false;
        this.importedFlashcards = [];
        this.approvedFlashcards = [];
      },
      error: (err) => {
        this.uploadResult = 'Import failed: ' + (err.error?.message || err.message || 'Unknown error');
        this.loading = false;
      }
    });
  }

  exportFlashcards() {
    this.exportService.exportFlashcards().subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `flashcards-export-${new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    });
  }
}
