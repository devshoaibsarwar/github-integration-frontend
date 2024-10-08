import { Component, ViewChild } from '@angular/core';
import { GithubService } from 'src/app//services/github.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-repositories',
  templateUrl: './repositories.component.html',
})
export class RepositoriesComponent {
  @ViewChild(MatPaginator) paginator: MatPaginator | undefined;
  gridOptions: any;
  rowData: any;
  isLoading = true;
  length = 0;

  displayedColumns: string[] = ['name', 'description', 'slug', 'url'];
  dataSource: MatTableDataSource<any[]>;

  constructor(private githubService: GithubService) {
    this.dataSource = new MatTableDataSource();
  }

  ngOnInit() {
    this.getUserRepos();
  }

  ngAfterViewInit() {
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
  }

  handlePageEvent(event: PageEvent) {
    console.log(event);
    this.getUserRepos(event.pageIndex + 1);
  }
  getUserRepos(page = 1) {
    this.githubService.getUserRepos(page).subscribe(
      (response: any) => {
        console.log(response);
        this.dataSource = new MatTableDataSource(response?.docs);
        this.length = response.totalDocs;
        this.isLoading = false;
        console.log('here', this.isLoading);
      },
      (error: any) => {
        console.error('Error in component:', error);
        this.isLoading = false;
      }
    );
  }
}
