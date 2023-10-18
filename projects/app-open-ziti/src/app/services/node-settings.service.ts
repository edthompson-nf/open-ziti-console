import {Injectable} from '@angular/core';
import {isEmpty, defer} from "lodash";
import {HttpBackend} from "@angular/common/http";
import {SettingsServiceClass} from "open-ziti-console-lib";

// @ts-ignore
const {growler} = window;

@Injectable({
    providedIn: 'root'
})
export class NodeSettingsService extends SettingsServiceClass {

    hasNodeSession = false;
    constructor(override httpBackend: HttpBackend) {
        super(httpBackend);
    }

    async init() {
        this.get();
        this.version();

        if (this.settings.port && !isNaN(this.settings.port)) this.port = this.settings.port;
        if (this.settings.portTLS && !isNaN(this.settings.portTLS)) this.portTLS = this.settings.portTLS;
        if (this.settings.rejectUnauthorized && !isNaN(this.settings.rejectUnauthorized)) this.rejectUnauthorized = this.settings.rejectUnauthorized;
        await this.checkForValidNodeSession();
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
            this.settings.selectedEdgeController = controllerURL;
            this.settings.edgeControllers = result.edgeControllers;
            this.set(this.settings);
        });
    }

    override clearSession(): Promise<any>  {
        const serverUrl = this.settings.protocol + '://' + this.settings.host + ':' +this.settings.port;
        const apiUrl = serverUrl + '/login?logout=true';
        const options = this.getHttpOptions();
        return this.httpClient.get(apiUrl, options).toPromise().then((resp: any) => {
            if(isEmpty(resp?.error)) {
                defer(() => {
                    window.location.href = window.location.origin + '/ziti-console/login';
                });
            } else {
                growler.error("Unknow error encountered when logging out");
            }
        }).catch((resp) => {
            return false;
        });
    }

    checkForValidNodeSession(): Promise<boolean> {
        const serverUrl = this.settings.protocol + '://' + this.settings.host + ':' +this.settings.port;
        const options = {
            headers: {
                accept: 'application/json',
            },
            params: {},
            responseType: 'json' as const,
        };
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
        return this.httpClient.post(apiUrl, body, options).toPromise().then((resp: any) => {
            //just checking for a non-error response to see if there is a valid session with the node server
            this.hasNodeSession = isEmpty(resp?.error);
            return this.hasNodeSession;
        }).catch((resp) => {
            this.hasNodeSession = false;
            return false;
        });
    }
}
