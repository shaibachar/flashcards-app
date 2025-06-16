import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class FlashcardBulkExportService {
  constructor(private http: HttpClient) {}

  exportFlashcards() {
    return this.http.get('/flashcardbulkexport/export-json', { responseType: 'blob' });
  }
}
