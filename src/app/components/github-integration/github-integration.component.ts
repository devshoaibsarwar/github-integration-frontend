import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { IntegrationDetails } from 'src/app/interfaces/User';
import { GithubService } from 'src/app/services/github.service';

@Component({
  selector: 'app-github-integration',
  templateUrl: './github-integration.component.html',
  styleUrls: ['./github-integration.component.css'],
})
export class GithubIntegrationComponent implements OnInit {
  integrationDetails: IntegrationDetails | null = null;
  isLoading = true;
  private readonly _destroy$ = new Subject<void>();
  public readonly destroy$ = this._destroy$.asObservable();

  constructor(
    private githubService: GithubService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams
      .pipe(takeUntil(this._destroy$))
      .subscribe((params) => {
        const { code } = params || {};

        if (!code) {
          this.getIntegrationDetails();
          return;
        }

        this.getAccessToken(code);
      });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  private getIntegrationDetails() {
    this.githubService
      .getIntegrationDetails()
      .pipe(takeUntil(this._destroy$))
      .subscribe(
        (response: any) => {
          this.integrationDetails = response?.data as IntegrationDetails;
          this.isLoading = false;
        },
        (error: any) => {
          console.error('Error in component:', error);
          this.isLoading = false;
        }
      );
  }

  private getAccessToken(code: string) {
    this.githubService
      .getAccessToken(code)
      .pipe(takeUntil(this._destroy$))
      .subscribe(
        (response) => {
          const user = response.data as IntegrationDetails;
          this.router.navigate(['/github']);
          localStorage.setItem('accessToken', user.accessToken);
        },
        (error) => {
          console.error('Error in component:', error);
          this.router.navigate(['/github']);
        }
      );
  }

  connect(): void {
    this.githubService.connectToGithub();
  }

  remove(): void {
    this.githubService
      .removeIntegration()
      .pipe(takeUntil(this._destroy$))
      .subscribe(
        (response) => {
          localStorage.removeItem('accessToken');
          this.integrationDetails = null;
        },
        (error) => {
          console.error('Error in component:', error);
          this.router.navigate(['/github']);
        }
      );
  }
}
