import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from 'src/environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class GithubService {
  private apiUrl: string = (environment as any).apiUrl;
  private githubClientId: string = (environment as any).githubClientID;
  private githubOAuthUrl: string = (environment as any).githubOAuthUrl;
  private redirectUri = `${window.location.origin}/redirect`;

  constructor(private http: HttpClient) {}

  connectToGithub(): void {
    window.location.href = `${this.githubOAuthUrl}/authorize/?client_id=${this.githubClientId}&redirect_uri=${this.redirectUri}&scope=user`;
  }

  getAccessToken(code: string): Observable<any> {
    const data = {
      code,
    };

    return this.http.post(`${this.apiUrl}/auth/sign-up`, data).pipe(
      catchError((response) => {
        console.error('HTTP error:', response.error, response.error?.message);

        return throwError(
          !response.error?.success
            ? response.error
            : 'Something went wrong. Please try again.'
        );
      })
    );
  }

  removeIntegration(): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/github-integration/`);
  }

  getIntegrationDetails(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/github-integration/`);
  }

  getUserRepos(page = 0): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/repositories/`, {
      params: { page },
    });
  }

  isAuthenticatedUser(): boolean {
    return !!localStorage.getItem('accessToken');
  }
}
