import {CanActivateFn, Router} from '@angular/router';
import {Inject, Injectable, InjectionToken} from "@angular/core";
import {SettingsService, SETTINGS_SERVICE} from "open-ziti-console-lib";
// @ts-ignore
const {growler} = window;

export const AUTHENTICATION_GUARD = new InjectionToken<any>('AUTHENTICATION_GUARD');

@Injectable({providedIn: 'root'})
export class ZitiAuthenticationGuard {
    constructor(@Inject(SETTINGS_SERVICE) private settingsSvc: SettingsService, private router: Router) {
    }

    canActivate(next, state) {
        const isAuthorized = !!this.settingsSvc.settings.session?.id;
        if (!isAuthorized) {
            // messaging.error('not authorized');
            this.router.navigate(['/login']);
        }

        return isAuthorized;
    }
}
