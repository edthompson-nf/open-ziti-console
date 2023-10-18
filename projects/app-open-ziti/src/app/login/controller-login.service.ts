import {Injectable, Inject} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {SettingsServiceClass, GrowlerService, GrowlerModel, SETTINGS_SERVICE} from "open-ziti-console-lib";
import {firstValueFrom, lastValueFrom, Observable, ObservableInput, of, switchMap, tap} from "rxjs";
import {catchError} from "rxjs/operators";
import {Router} from "@angular/router";
import moment from "moment";
import {debounce, delay, isEmpty} from "lodash";
import {LoginServiceClass} from "./login-service.class";

@Injectable({
    providedIn: 'root'
})
export class ControllerLoginService extends LoginServiceClass {
    private domain = '';

    constructor(
        override httpClient: HttpClient,
        @Inject(SETTINGS_SERVICE) override settingsService: SettingsServiceClass,
        override router: Router,
        override growlerService: GrowlerService
    ) {
        super(httpClient, settingsService, router, growlerService);
    }

    async login(prefix: string, url: string, username: string, password: string) {
        this.controllerLogin(prefix, url, username, password);
    }

    controllerLogin(prefix: string, url: string, username: string, password: string) {
        this.domain = url;
        const serviceUrl = url + prefix;
        return lastValueFrom(this.observeLogin(serviceUrl, username, password)
        ).then(() => {
            this.router.navigate(['/']);
        });
    }

    observeLogin(serviceUrl: string, username: string, password: string) {
        return this.httpClient.post(serviceUrl + "/authenticate?method=password", {
            username,
            password,
            rejectUnauthorized: false
        }, {
            headers: {
                "content-type": "application/json",
            }
        })
            .pipe(
                switchMap((body: any) => {
                    return this.handleLoginResponse.bind(this)(body, username, password)
                }),
                catchError((err: any) => {
                    const error = "Server Not Accessible";
                    if (err.code != "ECONNREFUSED") throw({error: err.code});
                    throw({error: error});
                })
            );
    }

    private handleLoginResponse(body: any, username: string, password: string): Observable<any> {
        if (body.error) throw body.error;
        const settings = {
            ...this.settingsService.settings, session: {
                id: body.data?.token,
                controllerDomain: this.domain,
                authorization: 100,
                expiresAt: body.data.expiresAt,
                username,
                password
            }
        }
        this.settingsService.set(settings);
        return of([body.data?.token]);
    }
}
