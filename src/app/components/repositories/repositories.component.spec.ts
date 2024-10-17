import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RepositoriesComponent } from './repositories.component';
import { GithubService } from 'src/app/services/github.service';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { of, throwError } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('RepositoriesComponent', () => {
  let component: RepositoriesComponent;
  let fixture: ComponentFixture<RepositoriesComponent>;
  let githubService: jasmine.SpyObj<GithubService>;

  beforeEach(() => {
    const githubServiceSpy = jasmine.createSpyObj('GithubService', [
      'getUserRepos',
    ]);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [RepositoriesComponent],
      providers: [
        { provide: HttpClientTestingModule },
        { provide: GithubService, useValue: githubServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RepositoriesComponent);
    component = fixture.componentInstance;
    githubService = TestBed.inject(
      GithubService
    ) as jasmine.SpyObj<GithubService>;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should set paginator after view init', () => {
    component.ngAfterViewInit();

    expect(component.dataSource.paginator).toBeUndefined();

    component.paginator = {} as MatPaginator;
    component.ngAfterViewInit();

    expect(component.dataSource.paginator).toBeDefined();
  });

  it('should fetch user repositories and set data source', () => {
    const mockResponse = {
      docs: [{ name: 'Repo 1' }, { name: 'Repo 2' }],
      totalDocs: 2,
    };
    githubService.getUserRepos.and.returnValue(of(mockResponse));

    // @ts-ignore
    component.getUserRepos();

    expect(githubService.getUserRepos).toHaveBeenCalledWith(1);
    expect(component.length).toBe(2);
    expect(component.isLoading).toBeFalse();
  });

  it('should handle errors when fetching user repositories', () => {
    githubService.getUserRepos.and.returnValue(throwError('Error'));

    // @ts-ignore
    component.getUserRepos();

    expect(component.isLoading).toBeFalse();
  });

});
