import {Injectable} from '@angular/core';
import {isEmpty, defer} from "lodash";
import {HttpBackend} from "@angular/common/http";
import {SettingsServiceClass, GrowlerService, GrowlerModel} from "open-ziti-console-lib";
import {firstValueFrom, map, tap} from "rxjs";
import {catchError} from "rxjs/operators";

// @ts-ignore
const {growler} = window;

@Injectable({
    providedIn: 'root'
})
export class NodeSettingsService extends SettingsServiceClass {

    hasNodeSession = false;
    constructor(override httpBackend: HttpBackend, override growlerService: GrowlerService) {
        super(httpBackend, growlerService);
    }

    async init() {
        this.get();
        this.version();

        if (this.settings.port && !isNaN(this.settings.port)) this.port = this.settings.port;
        if (this.settings.portTLS && !isNaN(this.settings.portTLS)) this.portTLS = this.settings.portTLS;
        if (this.settings.rejectUnauthorized && !isNaN(this.settings.rejectUnauthorized)) this.rejectUnauthorized = this.settings.rejectUnauthorized;
        return Promise.resolve();
    }

    hasSession() {
        return this.hasNodeSession;
    }

    override controllerSave(name, controllerURL) {
        const nodeServerURL = this.settings.protocol + '://' + this.settings.host + ':' + this.settings.port;
        const apiURL = nodeServerURL + '/api/controllerSave';
        this.httpClient.post(
            apiURL,
            { url: controllerURL, name: name },
            {
                headers: {
                    "content-type": "application/json"
                }
            }
        ).toPromise().then((result: any) => {
            if (!isEmpty(result.error)) {
                let growlerData = new GrowlerModel(
                    'error',
                    'Error',
                    `Login Failed`,
                    result.error,
                );
                this.growlerService.show(growlerData);
            } else {
                this.settings.selectedEdgeController = controllerURL;
                this.settings.edgeControllers = result.edgeControllers;
                this.set(this.settings);
            }
        }).catch((err) => {
            let growlerData = new GrowlerModel(
                'error',
                'Error',
                `Login Failed`,
                `Unable to connect - please make sure the URL is correct and the controller is online`,
            );
            this.growlerService.show(growlerData);
        });
    }

    public initApiVersions(url: string) {
        const options = {
            headers: {
                accept: 'application/json',
            },
            params: {},
            responseType: 'json' as const,
        };
        const callUrl = "/api/version";
        return firstValueFrom(this.httpClient.post(callUrl, {}, options)
            .pipe(
                tap((body: any) => {
                    try {
                        if (body.error) {
                            growler.error("Invalid Edge Controller: " + body.error);
                        } else {
                            this.apiVersions = body.data.apiVersions;
                        }
                    } catch (e) {
                        growler.error("Invalid Edge Controller: " + body);
                    }
                }),
                catchError((err: any) => {
                    throw "Edge Controller not Online: " + err?.message;
                }),
                map(body => body.data.apiVersions)));
    }
}
