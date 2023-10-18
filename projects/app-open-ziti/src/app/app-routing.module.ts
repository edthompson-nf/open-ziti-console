import {NgModule} from '@angular/core';
import {RouterModule, Routes, mapToCanActivate} from '@angular/router';
import {PageNotFoundComponent} from "./page-not-found/page-not-found.component";
import {ZitiAuthenticationGuard} from "./guards/ziti-authentication.guard";
import {LoginComponent} from "./login/login.component";
import {
  ConfigurationsPageComponent,
  ZacWrapperComponent,
  IdentitiesPageComponent,
  DeactivateGuardService
} from "open-ziti-console-lib";
import {environment} from "./environments/environment";
import {URLS} from "./app-urls.constants";
import {NodeAuthenticationGuard} from "./guards/node-authentication.guard";
let authenticationGuard;
if(environment.nodeIntegration) {
  authenticationGuard = NodeAuthenticationGuard;
} else {
  authenticationGuard = ZitiAuthenticationGuard;
}

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
    canActivate: mapToCanActivate([authenticationGuard]),
  },
  {
    path: 'attributes',
    component: ZacWrapperComponent,
    canActivate: mapToCanActivate([authenticationGuard]),
  },
  {
    path: 'identities',
    component: IdentitiesPageComponent,
    canActivate: mapToCanActivate([authenticationGuard]),
    canDeactivate: [DeactivateGuardService],
  },
  {
    path: 'jwt-signers',
    component: ZacWrapperComponent,
    canActivate: mapToCanActivate([authenticationGuard]),
  },
  {
    path: 'services',
    component: ZacWrapperComponent,
    canActivate: mapToCanActivate([authenticationGuard]),
  },
  {
    path: 'routers',
    component: ZacWrapperComponent,
    canActivate: mapToCanActivate([authenticationGuard]),
  },
  {
    path: 'transit-routers',
    component: ZacWrapperComponent,
    canActivate: mapToCanActivate([authenticationGuard]),
  },
  {
    path: 'config-types',
    component: ZacWrapperComponent,
    canActivate: mapToCanActivate([authenticationGuard]),
  },
  {
    path: 'configs',
    component: ZacWrapperComponent,
    canActivate: mapToCanActivate([authenticationGuard]),
  },
  {
    path: 'recipies',
    component: ZacWrapperComponent,
    canActivate: mapToCanActivate([authenticationGuard]),
  },
  {
    path: 'terminators',
    component: ZacWrapperComponent,
    canActivate: mapToCanActivate([authenticationGuard]),
  },
  {
    path: 'service-policies',
    component: ZacWrapperComponent,
    canActivate: mapToCanActivate([authenticationGuard]),
  },
  {
    path: 'router-policies',
    component: ZacWrapperComponent,
    canActivate: mapToCanActivate([authenticationGuard]),
  },
  {
    path: 'service-policies',
    component: ZacWrapperComponent,
    canActivate: mapToCanActivate([authenticationGuard]),
  },
  {
    path: 'auth-policies',
    component: ZacWrapperComponent,
    canActivate: mapToCanActivate([authenticationGuard]),
  },
  {
    path: 'certificate-authorities',
    component: ZacWrapperComponent,
    canActivate: mapToCanActivate([authenticationGuard]),
  },
  {
    path: 'service-router-policies',
    component: ZacWrapperComponent,
    canActivate: mapToCanActivate([authenticationGuard]),
  },
  {
    path: 'posture-checks',
    component: ZacWrapperComponent,
    canActivate: mapToCanActivate([authenticationGuard]),
  },
  {
    path: 'recipes',
    component: ZacWrapperComponent,
    canActivate: mapToCanActivate([authenticationGuard]),
  },
  {
    path: 'organization',
    component: ZacWrapperComponent,
    canActivate: mapToCanActivate([authenticationGuard]),
  },
  {
    path: 'profile',
    component: ZacWrapperComponent,
    canActivate: mapToCanActivate([authenticationGuard]),
  },
  {
    path: 'servers',
    component: ZacWrapperComponent,
    canActivate: mapToCanActivate([authenticationGuard]),
  },
  {
    path: 'sessions',
    component: ZacWrapperComponent,
    canActivate: mapToCanActivate([authenticationGuard]),
  },
  {
    path: 'settings',
    component: ZacWrapperComponent,
    canActivate: mapToCanActivate([authenticationGuard]),
  },
  {
    path: 'custom-fields',
    component: ZacWrapperComponent,
    canActivate: mapToCanActivate([authenticationGuard]),
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
