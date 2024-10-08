import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IntegrationDetails } from 'src/app/interfaces/User';
import { GithubService } from 'src/app/services/github.service';

@Component({
  selector: 'app-github-integration',
  templateUrl: './github-integration.component.html',
  styleUrls: ['./github-integration.component.css'],
})
export class GithubIntegrationComponent implements OnInit {
  integrationDetails: any;
  isLoading = true;

  constructor(
    private githubService: GithubService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const { code } = params || {};

      if (!code) {
        this.getIntegrationDetails();
        return;
      }

      this.getAccessToken(code);
    });
  }

  getIntegrationDetails() {
    this.githubService.getIntegrationDetails().subscribe(
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

  getAccessToken(code: string) {
    this.githubService.getAccessToken(code).subscribe(
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
    this.githubService.removeIntegration().subscribe(() => {
      localStorage.removeItem('accessToken');
      this.integrationDetails = null;
    });
  }
}
