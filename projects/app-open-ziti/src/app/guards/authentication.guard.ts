import {CanActivateFn, Router} from '@angular/router';
import {inject} from "@angular/core";
import {SettingsService, SETTINGS_SERVICE} from "open-ziti-console-lib";
// @ts-ignore
const {growler} = window;

export const authenticationGuard: CanActivateFn = (route, state) => {
  const settingsSvc = inject(SETTINGS_SERVICE);
  const isAuthorized = !!settingsSvc.settings.session?.id;
  if (!isAuthorized) {
    // messaging.error('not authorized');
    inject(Router).navigate(['/login']);
  }

  return isAuthorized;
};
