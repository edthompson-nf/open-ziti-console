import {Injectable, Inject} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {SettingsServiceClass, GrowlerService, GrowlerModel, SETTINGS_SERVICE} from "open-ziti-console-lib";
import {Router} from "@angular/router";
import {LoginServiceClass} from "./login-service.class";
import {Observable, switchMap, catchError, lastValueFrom, of} from "rxjs";
import {NodeSettingsService} from "../services/node-settings.service";

@Injectable({
    providedIn: 'root'
})
export class NodeLoginService extends LoginServiceClass {
    private domain = '';

    constructor(
        override httpClient: HttpClient,
        @Inject(SETTINGS_SERVICE) override settingsService: NodeSettingsService,
        override router: Router,
        override growlerService: GrowlerService
    ) {
        super(httpClient, settingsService, router, growlerService);
    }

    async login(prefix: string, url: string, username: string, password: string) {
        this.nodeLogin(url, username, password);
    }

    nodeLogin(controllerURL: string, username: string, password: string) {
        return lastValueFrom(this.observeLogin(controllerURL, username, password)
            ).then(() => {
                this.router.navigate(['/']);
            });
    }

    observeLogin(controllerURL: string, username: string, password: string): Observable<any> {
        const nodeServerURL = this.settingsService.settings.protocol + '://' + this.settingsService.settings.host + ':' + this.settingsService.settings.port;
        const loginURL = nodeServerURL + '/api/login';
        return this.httpClient.post(
            loginURL,
            { url: controllerURL, username: username, password: password },
            {
                headers: {
                    "content-type": "application/json"
                }
            }
        ).pipe(
            switchMap((body: any) => {
                return this.handleLoginResponse.bind(this)(body);
            }),
            catchError((err: any) => {
                const error = "Server Not Accessible";
                if (err.code != "ECONNREFUSED") throw({error: err.code});
                throw({error: error});
            })
        );
    }

    private async handleLoginResponse(body: any): Promise<any> {
        if (body.success) {
            await this.settingsService.checkForValidNodeSession();
            this.settingsService.set(this.settingsService.settings);
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
        return of([body.success]);
    }
}