import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {SettingsService, GrowlerService, GrowlerModel} from "open-ziti-console-lib";
import {firstValueFrom, lastValueFrom, Observable, ObservableInput, of, switchMap, tap} from "rxjs";
import {catchError} from "rxjs/operators";
import {Router} from "@angular/router";
import moment from "moment";
import {debounce, delay, isEmpty} from "lodash";

@Injectable({
    providedIn: 'root'
})
export class LoginService {
    private domain = '';

    constructor(
        private httpClient: HttpClient,
        private settingsService: SettingsService,
        private router: Router,
        private growlerService: GrowlerService
    ) {
    }

    async login(prefix: string, url: string, username: string, password: string) {
        if (this.settingsService.settings.useNodeServer) {
            this.nodeLogin(url, username, password);
        } else {
            this.controllerLogin(prefix, url, username, password)
        }
    }

    controllerLogin(prefix: string, url: string, username: string, password: string) {
        this.domain = url;
        const serviceUrl = url + prefix;
        return lastValueFrom(this.observeLogin(serviceUrl, username, password)
        ).then(() => {
            this.router.navigate(['/']);
        });
    }

    nodeLogin(controllerURL: string, username: string, password: string) {
        const nodeServerURL = this.settingsService.settings.protocol + '://' + this.settingsService.settings.host + ':' + this.settingsService.settings.port;
        const loginURL = nodeServerURL + '/api/login';
        this.httpClient.post(
            loginURL,
            { url: controllerURL, username: username, password: password },
            {
                headers: {
                    "content-type": "application/json"
                }
            }
        ).toPromise().then((result: any) => {
            if (result.success) {
                this.router.navigate(['/dashboard']);
            } else {
                const growlerData = new GrowlerModel(
                    'error',
                    'Error',
                    `Login Failed`,
                    `Unable to login to selected edge controller`,
                );
                this.growlerService.show(growlerData);
            }
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
