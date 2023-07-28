import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {PageNotFoundComponent} from "./page-not-found/page-not-found.component";
import {authenticationGuard} from "./guards/authentication.guard";
import {LoginComponent} from "./login/login.component";
import {
  ConfigurationFormComponent,
  ConfigurationsPageComponent,
  ZacWrapperComponent,
  ZitiIdentitiesComponent
} from "open-ziti-console-lib";

const routes: Routes = [
  {
    path: '',
    redirectTo: 'ziti-dashboard',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'ziti-login',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'ziti-dashboard',
    component: ZacWrapperComponent,
    canActivate: [authenticationGuard],
  },
  {
    path: 'ziti-identities',
    component: ZitiIdentitiesComponent,
    canActivate: [authenticationGuard],
  },
  {
    path: 'ziti-jwt-signers',
    component: ZacWrapperComponent,
    canActivate: [authenticationGuard],
  },
  {
    path: 'ziti-services',
    component: ZacWrapperComponent,
    canActivate: [authenticationGuard],
  },
  {
    path: 'ziti-routers',
    component: ZacWrapperComponent,
    canActivate: [authenticationGuard],
  },
  {
    path: 'transit-routers',
    component: ZacWrapperComponent,
    canActivate: [authenticationGuard],
  },
  {
    path: 'configs',
    component: ConfigurationsPageComponent,
    canActivate: [authenticationGuard],
  },
  {
    path: 'recipes',
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
    path: 'service-router-policies',
    component: ZacWrapperComponent,
    canActivate: [authenticationGuard],
  },
  {
    path: 'auth-policies',
    component: ZacWrapperComponent,
    canActivate: [authenticationGuard],
  },
  {
    path: 'posture-checks',
    component: ZacWrapperComponent,
    canActivate: [authenticationGuard],
  },
  {
    path: 'certificate-authorities',
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
    path: 'config-types',
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
