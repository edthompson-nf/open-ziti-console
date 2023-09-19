import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {PageNotFoundComponent} from "./page-not-found/page-not-found.component";
import {authenticationGuard} from "./guards/authentication.guard";
import {LoginComponent} from "./login/login.component";
import {
  ConfigurationsPageComponent,
  ZacWrapperComponent,
  IdentitiesPageComponent
} from "open-ziti-console-lib";
import {URLS} from "./app-urls.constants";

const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'login',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    component: ZacWrapperComponent,
    canActivate: [authenticationGuard],
  },
  {
    path: 'attributes',
    component: ZacWrapperComponent,
    canActivate: [authenticationGuard],
  },
  {
    path: 'identities',
    component: IdentitiesPageComponent,
    canActivate: [authenticationGuard],
  },
  {
    path: 'jwt-signers',
    component: ZacWrapperComponent,
    canActivate: [authenticationGuard],
  },
  {
    path: 'services',
    component: ZacWrapperComponent,
    canActivate: [authenticationGuard],
  },
  {
    path: 'routers',
    component: ZacWrapperComponent,
    canActivate: [authenticationGuard],
  },
  {
    path: 'transit-routers',
    component: ZacWrapperComponent,
    canActivate: [authenticationGuard],
  },
  {
    path: 'config-types',
    component: ZacWrapperComponent,
    canActivate: [authenticationGuard],
  },
  {
    path: 'configs',
    component: ZacWrapperComponent,
    canActivate: [authenticationGuard],
  },
  {
    path: 'recipies',
    component: ZacWrapperComponent,
    canActivate: [authenticationGuard],
  },
  {
    path: 'terminators',
    component: ZacWrapperComponent,
    canActivate: [authenticationGuard],
  },
  {
    path: 'service-policies',
    component: ZacWrapperComponent,
  },
  {
    path: 'router-policies',
    component: ZacWrapperComponent,
    canActivate: [authenticationGuard],
  },
  {
    path: 'service-policies',
    component: ZacWrapperComponent,
    canActivate: [authenticationGuard],
  },
  {
    path: 'auth-policies',
    component: ZacWrapperComponent,
    canActivate: [authenticationGuard],
  },
  {
    path: 'certificate-authorities',
    component: ZacWrapperComponent,
    canActivate: [authenticationGuard],
  },
  {
    path: 'service-router-policies',
    component: ZacWrapperComponent,
    canActivate: [authenticationGuard],
  },
  {
    path: 'posture-checks',
    component: ZacWrapperComponent,
    canActivate: [authenticationGuard],
  },
  {
    path: 'recipes',
    component: ZacWrapperComponent,
    canActivate: [authenticationGuard],
  },
  {
    path: 'organization',
    component: ZacWrapperComponent,
    canActivate: [authenticationGuard],
  },
  {
    path: 'profile',
    component: ZacWrapperComponent,
    canActivate: [authenticationGuard],
  },
  {
    path: 'servers',
    component: ZacWrapperComponent,
    canActivate: [authenticationGuard],
  },
  {
    path: 'sessions',
    component: ZacWrapperComponent,
    canActivate: [authenticationGuard],
  },
  {
    path: 'settings',
    component: ZacWrapperComponent,
    canActivate: [authenticationGuard],
  },
  {
    path: 'custom-fields',
    component: ZacWrapperComponent,
    canActivate: [authenticationGuard],
  },
  {
    path: '**',
    component: PageNotFoundComponent,
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes,
    {enableTracing: true})],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
