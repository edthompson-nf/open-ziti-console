import {CanActivateFn, Router} from '@angular/router';
import {inject} from "@angular/core";
import {SettingsService} from "open-ziti-console-lib";
// @ts-ignore
const {growler} = window;

export const authenticationGuard: CanActivateFn = (route, state) => {
  const settingsSvc = inject(SettingsService);
  const isAuthorized = !!settingsSvc.settings.session?.id;
  if (!isAuthorized && !settingsSvc.settings.useNodeServer) {
    // messaging.error('not authorized');
    inject(Router).navigate(['/login']);
  }

  return isAuthorized || settingsSvc.settings.useNodeServer;
};
