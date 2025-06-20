import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LearningPath } from '../models/LearningPath';
import { Observable } from 'rxjs';

const API_BASE_URL =
  window.location.hostname === 'localhost'
    ? 'http://localhost:5000'
    : `http://${window.location.hostname}:5000`;

@Injectable({ providedIn: 'root' })
export class LearningPathService {
  private apiUrl = `${API_BASE_URL}/api/learning-paths`;

  constructor(private http: HttpClient) { }

  getAll(): Observable<LearningPath[]> {
    return this.http.get<LearningPath[]>(this.apiUrl);
  }

  add(path: LearningPath): Observable<any> {
    return this.http.post(this.apiUrl, path);
  }

  update(path: LearningPath): Observable<any> {
    return this.http.put(this.apiUrl, path);
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
