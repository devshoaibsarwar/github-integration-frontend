import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { GithubIntegrationComponent } from './github-integration.component';
import { GithubService } from 'src/app/services/github.service';
import { IntegrationDetails } from 'src/app/interfaces/User';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('GithubIntegrationComponent', () => {
  let component: GithubIntegrationComponent;
  let fixture: ComponentFixture<GithubIntegrationComponent>;
  let githubService: jasmine.SpyObj<GithubService>;
  let router: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;

  beforeEach(() => {
    const githubServiceSpy = jasmine.createSpyObj('GithubService', [
      'getIntegrationDetails',
      'getAccessToken',
      'connectToGithub',
      'removeIntegration',
    ]);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    mockActivatedRoute = {
      queryParams: of({ code: null }),
    };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [GithubIntegrationComponent],
      providers: [
        { provide: GithubService, useValue: githubServiceSpy },
        { provide: HttpClientTestingModule },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GithubIntegrationComponent);
    component = fixture.componentInstance;
    githubService = TestBed.inject(
      GithubService
    ) as jasmine.SpyObj<GithubService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should get integration details on init if no code is present', () => {
    const mockResponse: IntegrationDetails = {
      _id: '123',
      createdAt: 'new Date()',
      accessToken: 'mockAccessToken',
    };
    githubService.getIntegrationDetails.and.returnValue(
      of({ data: mockResponse })
    );

    component.ngOnInit();

    expect(githubService.getIntegrationDetails).toHaveBeenCalled();
    expect(component.integrationDetails).toEqual(mockResponse);
    expect(component.isLoading).toBeFalse();
  });

  it('should get access token if code is present', () => {
    mockActivatedRoute.queryParams = of({ code: 'mockCode' });
    const mockResponse = { data: { accessToken: 'mockAccessToken' } };
    githubService.getAccessToken.and.returnValue(of(mockResponse));

    component.ngOnInit();

    expect(githubService.getAccessToken).toHaveBeenCalledWith('mockCode');
    expect(localStorage.getItem('accessToken')).toBe('mockAccessToken');
    expect(router.navigate).toHaveBeenCalledWith(['/github']);
  });

  it('should handle errors in getting integration details', () => {
    githubService.getIntegrationDetails.and.returnValue(throwError('Error'));

    component.getIntegrationDetails();

    expect(component.isLoading).toBeFalse();
    expect(component.integrationDetails).toBeUndefined();
  });

  it('should handle errors in getting access token', () => {
    mockActivatedRoute.queryParams = of({ code: 'mockCode' });
    githubService.getAccessToken.and.returnValue(throwError('Error'));

    component.ngOnInit();

    expect(router.navigate).toHaveBeenCalledWith(['/github']);
  });

  it('should connect to Github', () => {
    component.connect();

    expect(githubService.connectToGithub).toHaveBeenCalled();
  });

  it('should remove integration and clear access token', () => {
    githubService.removeIntegration.and.returnValue(of());

    component.remove();

    expect(githubService.removeIntegration).toHaveBeenCalled();
    expect(localStorage.getItem('accessToken')).toBeNull();
  });
});
