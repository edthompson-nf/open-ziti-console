import {Injectable, InjectionToken} from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { Observable } from 'rxjs';

export const DEACTIVATE_GUARD = new InjectionToken<any>('DEACTIVATE_GUARD');

export interface CanComponentDeactivate {
    canDeactivate: () => Observable<boolean> | Promise<boolean> | boolean;
}

@Injectable()
export class DeactivateGuardService implements  CanDeactivate<CanComponentDeactivate>{

    canDeactivate(component: CanComponentDeactivate) {
        return component.canDeactivate ? component.canDeactivate() : true;
    }
}