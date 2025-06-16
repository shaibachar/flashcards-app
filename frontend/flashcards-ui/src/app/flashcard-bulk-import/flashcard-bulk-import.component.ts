import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FlashcardBulkExportService } from './flashcard-bulk-export.service';
import { MenuComponent } from '../menu/menu.component';

@Component({
  selector: 'app-flashcard-bulk-import',
  standalone: true,
  imports: [CommonModule, MenuComponent],
  templateUrl: './flashcard-bulk-import.component.html',
  styleUrls: ['./flashcard-bulk-import.component.css']
})
export class FlashcardBulkImportComponent {
  uploadResult: string = '';
  loading = false;

  constructor(private http: HttpClient, private exportService: FlashcardBulkExportService) {}

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        try {
          const json = JSON.parse(e.target.result);
          this.loading = true;
          this.uploadResult = '';
          this.http.post('/flashcardbulkimport/upload-json', json).subscribe({
            next: (res: any) => {
              this.uploadResult = res?.message || 'Import successful!';
              this.loading = false;
            },
            error: (err) => {
              this.uploadResult = 'Import failed: ' + (err.error?.message || err.message || 'Unknown error');
              this.loading = false;
            }
          });
        } catch (err) {
          this.uploadResult = 'Invalid JSON file.';
        }
      };
      reader.readAsText(file);
    }
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
