import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GithubIntegrationComponent } from './components/github-integration/github-integration.component';

const routes: Routes = [
  {
    path: 'github',
    component: GithubIntegrationComponent,
  },
  {
    path: 'redirect',
    component: GithubIntegrationComponent,
  },
  {
    path: '**',
    redirectTo: 'github',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
