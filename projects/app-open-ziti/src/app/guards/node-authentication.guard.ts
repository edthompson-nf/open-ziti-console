import {CanActivateFn, Router} from '@angular/router';
import {Inject, Injectable, InjectionToken} from "@angular/core";
import {SettingsServiceClass, SETTINGS_SERVICE} from "open-ziti-console-lib";
// @ts-ignore
const {growler} = window;

@Injectable({providedIn: 'root'})
export class NodeAuthenticationGuard {
    constructor(@Inject(SETTINGS_SERVICE) private settingsSvc: SettingsServiceClass, private router: Router) {
    }

    canActivate(next, state) {
        const isAuthorized = this.settingsSvc.hasSession();
        if(!isAuthorized) {
            this.router.navigate(['/login']);
        }
        return isAuthorized;
    }
}
