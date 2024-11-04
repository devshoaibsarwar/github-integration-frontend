import { Component, OnInit, ViewChild } from '@angular/core';
import { GithubService } from 'src/app//services/github.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { RepositoryDetails } from 'src/app/interfaces/Repository';
import { Subject } from 'rxjs';
import 'ag-grid-enterprise';
import { GridReadyEvent, IServerSideDatasource } from 'ag-grid-community';
import { CheckboxComponent } from 'src/generic/checkbox/checkbox.component';

const COMMON_GRID_OPTIONS = {
  rowSelection: 'none',
  paginationPageSizeSelector: [5, 10, 20, 50],
  masterDetail: true,
  pagination: true,
  rowModelType: 'serverSide',
  defaultColDef: {
    flex: 1,
  },
};

@Component({
  selector: 'app-repositories',
  templateUrl: './repositories.component.html',
})
export class RepositoriesComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator | undefined;
  isLoading = false;
  length = 0;

  gridOptions: any;
  detailGridOptions: any;
  rowData: any;
  detailRowData: any;
  page = 0;
  pageSize = 10;
  public context: any = null;
  public overlayNoRowsTemplate: string =
    '<div style="padding: 10px; text-align: center;">No data available</div>';

  displayedColumns: string[] = ['name', 'description', 'slug', 'url'];
  dataSource: MatTableDataSource<RepositoryDetails[]>;
  private readonly _destroy$ = new Subject<void>();
  public readonly destroy$ = this._destroy$.asObservable();

  constructor(private githubService: GithubService) {
    this.dataSource = new MatTableDataSource();
    this.detailGridOptions = {
      columnDefs: [
        { field: 'userId', headerName: 'User Id' },
        { field: 'username', headerName: 'User' },
        { field: 'repository.name', headerName: 'Repository' },
        { field: 'totalCommits', headerName: 'Total Commits' },
        { field: 'totalPRs', headerName: 'Total Pull Requests.' },
        { field: 'totalIssues', headerName: 'Total Issues' },
      ],
      paginationPageSize: this.pageSize,
      cacheBlockSize: this.pageSize,
      ...COMMON_GRID_OPTIONS,
    };
    this.gridOptions = {
      columnDefs: [
        {
          field: '_id',
          headerName: 'ID',
        },
        { field: 'name', headerName: 'Name' },
        {
          field: 'url',
          headerName: 'Link',
          cellRenderer: (params: any) => {
            const url = params.value;
            return `<a href="${url}" target="_blank">${url}</a>`;
          },
        },

        { field: 'slug', headerName: 'Slug' },
        {
          field: 'isIncluded',
          headerName: 'Included',
          width: 40,
          cellRenderer: CheckboxComponent,
        },
      ],
      cacheBlockSize: this.pageSize,
      paginationPageSize: this.pageSize,
      ...COMMON_GRID_OPTIONS,
    };
  }
  ngOnInit(): void {
    this.context = {
      parentComponent: this,
    };
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

  onCheckboxChange(isIncluded: boolean, row: { _id: string }) {
    console.log('testing');
    this.githubService.initializeSyncing({ id: row._id, isIncluded }).subscribe(
      (data) => {
        console.log('Success:: ', data);
        if (isIncluded) {
          // this._snackBar.open('Your request has been initiated. Your data will be synced shortly');
        }
      },
      (error) => {
        console.log('Error:: ', error);
        // this._snackBar.open('Something went wrong. Please try again in few minutes.');
      }
    );
  }

  onGridReady(params: GridReadyEvent) {
    const datasource = this.getServerSideDatasource();
    params.api.updateGridOptions({ serverSideDatasource: datasource });
  }

  onDetailGridReady(params: GridReadyEvent) {
    const datasource = this.getServerSideDatasourceForDetails();
    params.api.updateGridOptions({ serverSideDatasource: datasource });
  }

  getServerSideDatasourceForDetails(): IServerSideDatasource {
    return {
      getRows: (params) => {
        const startIndex =
          Math.ceil((params?.request?.startRow || 0) / this.pageSize) + 1;

        this.githubService
          .getRepositoryDetails(startIndex, this.pageSize)
          .subscribe(
            (response) => {
              const { docs = [], totalDocs = 0 } = response;
              if (!docs.length && !totalDocs) {
                params.api.showNoRowsOverlay();
                params.success({ rowData: [], rowCount: 0 });
                return;
              }

              params.api.hideOverlay();

              this.rowData = docs;

              params.success({ rowData: this.rowData, rowCount: totalDocs });
            },
            () => {
              params.fail();
            }
          );
      },
    };
  }

  getServerSideDatasource(): IServerSideDatasource {
    return {
      getRows: (params) => {
        const startIndex =
          Math.ceil((params?.request?.startRow || 0) / this.pageSize) + 1;

        this.githubService.getRepositories(startIndex, this.pageSize).subscribe(
          (response) => {
            const { docs = [], totalDocs = 0 } = response;
            if (!docs.length && !totalDocs) {
              params.api.showNoRowsOverlay();
              params.success({ rowData: [], rowCount: 0 });
              return;
            }

            params.api.hideOverlay();

            this.detailRowData = docs;

            params.success({
              rowData: this.detailRowData,
              rowCount: totalDocs,
            });
          },
          () => {
            params.fail();
          }
        );
      },
    };
  }
}
