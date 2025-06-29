import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

const API_BASE_URL = environment.apiBaseUrl;

@Injectable({ providedIn: 'root' })
export class ImageService {
  private baseUrl = `${API_BASE_URL}/images`;
  constructor(private http: HttpClient) {}

  list(): Observable<string[]> {
    return this.http.get<string[]>(this.baseUrl);
  }

  upload(files: File[]): Observable<any> {
    const formData = new FormData();
    files.forEach(f => formData.append('files', f));
    return this.http.post(this.baseUrl + '/upload', formData);
  }

  delete(name: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${encodeURIComponent(name)}`);
  }

  deleteMany(names: string[]): Observable<any> {
    return this.http.post(this.baseUrl + '/delete', { names });
  }
}
