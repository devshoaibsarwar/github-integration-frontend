import { Component, OnInit, ViewChild } from '@angular/core';
import { GithubService } from 'src/app//services/github.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { RepositoryDetails } from 'src/app/interfaces/Repository';
import { Subject, takeUntil } from 'rxjs';
import 'ag-grid-enterprise';
import { GridReadyEvent, IServerSideDatasource } from 'ag-grid-community';
import { CheckboxComponent } from 'src/generic/checkbox/checkbox.component';

@Component({
  selector: 'app-repositories',
  templateUrl: './repositories.component.html',
})
export class RepositoriesComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator | undefined;
  isLoading = false;
  length = 0;

  gridOptions: any;
  rowData: any;
  page = 0;
  pageSize = 10;
  public context: any = null;
  public overlayNoRowsTemplate: string = '<div style="padding: 10px; text-align: center;">No data available</div>'

  displayedColumns: string[] = ['name', 'description', 'slug', 'url'];
  dataSource: MatTableDataSource<RepositoryDetails[]>;
  private readonly _destroy$ = new Subject<void>();
  public readonly destroy$ = this._destroy$.asObservable();

  constructor(private githubService: GithubService) {
    this.dataSource = new MatTableDataSource();
    this.gridOptions = {
      columnDefs: [
        {
          field: '_id',
          headerName: 'ID',
          cellRenderer: 'agGroupCellRenderer',
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
      rowSelection: 'none',
      paginationPageSize: this.pageSize,
      paginationPageSizeSelector: [5, 10, 20, 50],
      masterDetail: true,
      cacheBlockSize: this.pageSize,
      pagination: true,
      rowModelType: 'serverSide',
      defaultColDef: {
        flex: 1,
      },
      detailRowHeight: 160,
      detailCellRendererParams: {
        detailGridOptions: {
          columnDefs: [
            { field: 'userId', headerName: 'User Id' },
            { field: 'user', headerName: 'User' },
            { field: 'totalCommits', headerName: 'Total Commits' },
            { field: 'totalPRs', headerName: 'Total Pull Requests.' },
            { field: 'totalIssues', headerName: 'Total Issues' },
          ],
          defaultColDef: {
            flex: 1,
          },
          innerHeight: '30px'
        },
        getDetailRowData: (params: any) => {
          if (!params.data.isIncluded) {
            params.successCallback([]);
            return;
          }

          params.successCallback([
            {
              ...params.data.userRepoDetails[0],
              user: params.data.username,
            },
          ]);
        },
      },
    };
  }
  ngOnInit(): void {
    this.context =  {
      parentComponent: this
    }
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
    console.log('testing')
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
    )
  }

  onGridReady(params: GridReadyEvent) {
    const datasource = this.getServerSideDatasource();
    params.api.updateGridOptions({ serverSideDatasource: datasource })
  }

  getServerSideDatasource(): IServerSideDatasource {
    return {
      getRows: (params) => {
        const startIndex = Math.ceil((params?.request?.startRow || 0) / this.pageSize) + 1
        
        this.githubService.getRepositories(startIndex, this.pageSize)
          .subscribe(response => {
            const { docs = [], totalDocs = 0 } = response;
            if (!docs.length && !totalDocs) {
              params.api.showNoRowsOverlay();
              params.success({ rowData: [], rowCount: 0});
              return;
            }

            params.api.hideOverlay();

            this.rowData = docs;

            params.success({ rowData: this.rowData, rowCount: totalDocs });
          },
          () => {
            params.fail()
          });
      },
    };
  }

}
