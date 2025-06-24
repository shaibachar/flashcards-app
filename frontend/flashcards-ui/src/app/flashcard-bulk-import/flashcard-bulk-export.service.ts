import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FlashcardBulkExportService {
  constructor(private http: HttpClient) {}

  exportFlashcards() {
    const url = `${environment.apiBaseUrl}/flashcardbulkexport/export-json`;
    return this.http.get(url, { responseType: 'blob' });
  }
}
