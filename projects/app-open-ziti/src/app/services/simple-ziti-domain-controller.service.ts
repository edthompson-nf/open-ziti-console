import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, Subscription} from "rxjs";
import {SettingsService, ZitiDomainControllerService, ZitiSessionData} from "open-ziti-console-lib";
import {LoginService} from "../login/login.service";
import {HttpClient} from '@angular/common/http';

import {isEmpty} from 'lodash';

@Injectable({
    providedIn: 'root'
})
export class SimpleZitiDomainControllerService implements ZitiDomainControllerService {

    zitiSessionData: ZitiSessionData = {
        zitiDomain: '',
        zitiSessionId: '',
        expiresAt: ''
    }

    zitiSettings = new BehaviorSubject(this.zitiSessionData);
    constructor(private settingsService: SettingsService, private http: HttpClient) {
        this.settingsService.settingsChange.subscribe((results: any) => {
            this.zitiSessionData.zitiSessionId = results.session.id;
            this.zitiSessionData.zitiDomain = results.session.controllerDomain;
            this.zitiSettings.next({...this.zitiSessionData});
        });
    }

    hasNodeSession(): Promise<boolean> {
        const serverUrl = this.settingsService.settings.protocol + '://' + this.settingsService.settings.host + ':' +this.settingsService.settings.port;
        const options = this.getHttpOptions();
        const apiUrl = serverUrl + '/api/data';
        const body = {
            type: 'identities',
            paging: {
                page: 1,
                total: 1,
                sort: "name",
                order: "ASC",
                filter: "",
                noSearch: false
            }
        };
        return this.http.post(apiUrl, body, options).toPromise().then((resp: any) => {
            //just checking for a non-error response to see if there is a valid session with the node server
            return isEmpty(resp?.error);
        }).catch((resp) => {
            return false;
        });
    }

    getHttpOptions(useZitiCreds = false) {
        const options: any = {
            headers: {
                accept: 'application/json',
            },
            params: {},
            responseType: 'json' as const,
        };
        return options;
    }
}
