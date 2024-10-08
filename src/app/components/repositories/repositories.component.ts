import { Component, ViewChild } from '@angular/core';
import { GithubService } from 'src/app//services/github.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { RepositoryDetails } from 'src/app/interfaces/Repository';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-repositories',
  templateUrl: './repositories.component.html',
  styleUrls: ['./repositories.component.css'],
})
export class RepositoriesComponent {
  @ViewChild(MatPaginator) paginator: MatPaginator | undefined;
  isLoading = true;
  length = 0;

  displayedColumns: string[] = ['name', 'description', 'slug', 'url'];
  dataSource: MatTableDataSource<RepositoryDetails[]>;
  private readonly _destroy$ = new Subject<void>();
  public readonly destroy$ = this._destroy$.asObservable();

  constructor(private githubService: GithubService) {
    this.dataSource = new MatTableDataSource();
  }

  ngOnInit() {
    this.getUserRepos();
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
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

  private getUserRepos(page = 1) {
    this.githubService
      .getUserRepos(page)
      .pipe(takeUntil(this._destroy$))
      .subscribe(
        (response: any) => {
          this.dataSource = new MatTableDataSource(response?.docs);
          this.length = response.totalDocs;
          this.isLoading = false;
        },
        (error: any) => {
          console.error('Error in component:', error);
          this.isLoading = false;
        }
      );
  }
}
