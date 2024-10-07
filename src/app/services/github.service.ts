import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GithubService {
  private apiUrl = 'http://localhost:3000/auth';

  constructor(private http: HttpClient) {}

  connectToGithub(): void {
    window.location.href = `${this.apiUrl}/github`;
  }

  removeIntegration(username: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/github/${username}`);
  }

  getIntegration(username: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/github/${username}`);
  }
}