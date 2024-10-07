import { Component, OnInit } from '@angular/core';
import { GithubService } from 'src/app/services/github.service';

@Component({
  selector: 'app-github-integration',
  templateUrl: './github-integration.component.html',
  styleUrls: ['./github-integration.component.css'],
})
export class GithubIntegrationComponent implements OnInit {
  integrationDetails: any;
  username: string = 'your_github_username'; // Use logged-in user's username

  constructor(private githubService: GithubService) {}

  ngOnInit(): void {
    // Check if integration exists
    this.githubService.getIntegration(this.username).subscribe((data) => {
      this.integrationDetails = data;
    });
  }

  connect(): void {
    this.githubService.connectToGithub();
  }

  remove(): void {
    this.githubService.removeIntegration(this.username).subscribe(() => {
      this.integrationDetails = null;
    });
  }
}
