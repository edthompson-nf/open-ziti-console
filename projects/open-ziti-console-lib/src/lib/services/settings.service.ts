import {Injectable} from '@angular/core';
import {BehaviorSubject, firstValueFrom, map, tap} from "rxjs";
import {catchError} from "rxjs/operators";

import {HttpClient} from "@angular/common/http";

// @ts-ignore
const {service, growler, context, page, settings} = window;
const DEFAULTS = {
    "session": {},
    "edgeControllers": [],
    "editable": true,
    "update": false,
    "location": "../ziti",
    "protocol": "http",
    "host": "localhost",
    "port": 1408,
    "portTLS": 8443,
    "rejectUnauthorized": false,
    "mail": {
        "host": "",
        "port": 25,
        "secure": false,
        "auth": {
            "user": "",
            "pass": ""
        }
    },
    "from": "",
    "to": "",
    "useNodeServer": true
}

@Injectable({
    providedIn: 'root'
})
export class SettingsService {

    name = "settings";
    settings: any = {};
    versionData: any = {};
    settingsChange = new BehaviorSubject<any>({})
    rejectUnauthorized = false;
    port = DEFAULTS.port;
    portTLS = DEFAULTS.portTLS;
    apiVersions: any[] = [];
    useNodeServer = DEFAULTS.useNodeServer;
    protocol = DEFAULTS.protocol;
    host = DEFAULTS.host;

    constructor(private httpClient: HttpClient) {
    }

    init() {
        this.get();
        this.version();

        if (this.settings.port && !isNaN(this.settings.port)) this.port = this.settings.port;
        if (this.settings.portTLS && !isNaN(this.settings.portTLS)) this.portTLS = this.settings.portTLS;
        if (this.settings.rejectUnauthorized && !isNaN(this.settings.rejectUnauthorized)) this.rejectUnauthorized = this.settings.rejectUnauthorized;
        if(this.settings.selectedEdgeController) return this.initApiVersions(this.settings.selectedEdgeController);
        else return Promise.resolve();
    }

    get() {
        const tmp = localStorage.getItem('ziti.settings');
        if (tmp) {
            this.settings = JSON.parse(tmp);
        } else {
            this.settings = {...DEFAULTS};
            localStorage.setItem('ziti.settings', JSON.stringify(this.settings));
        }
        settings.data = this.settings;
        context.set(this.name, this.settings);
        this.settingsChange.next(this.settings)
    }

    set(data: any) {
        this.settings = data;
        localStorage.setItem('ziti.settings', JSON.stringify(data));
        context.set(this.name, this.settings);
        this.settingsChange.next(this.settings);
    }

    version() {
        this.versionData = localStorage.getItem('ziti.version');
        context.set("version", this.versionData);
        this.settings = {...this.settings, version: this.versionData};
        this.settingsChange.next(this.settings)
    }

    delete(url: string) {
        service.call("server", {url: url}, this.deleted, "DELETE");
    }

    deleted(e: any) {
        if (page != null && page.deleting != null && page.deleting == this.versionData.baseUrl) {
            window.location.href = "/login";
        }
    }

    addContoller(name: string, url: string) {
        if (name.trim().length == 0 || url.trim().length == 0) {
            growler.error("Name and URL required");
        } else {
            this.controllerSave(name, url);
        }
    }

    initApiVersions(url: string) {
        url = url.split('#').join('').split('?').join('');
        if (url.endsWith('/')) url = url.substr(0, url.length - 1);
        if (!url.startsWith('https://')) url = 'https://' + url;
        const callUrl = url + "/edge/management/v1/version?rejectUnauthorized=false";
        return firstValueFrom(this.httpClient.get(callUrl)
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

    private controllerSave(name: string, url: string) {
        url = url.split('#').join('').split('?').join('');
        if (url.endsWith('/')) url = url.substr(0, url.length - 1);
        if (!url.startsWith('https://')) url = 'https://' + url;
        const callUrl = url + "/edge/management/v1/version?rejectUnauthorized=" + this.rejectUnauthorized;
        firstValueFrom(this.httpClient.get(callUrl).pipe(catchError((err: any) => {
            throw "Edge Controller not Online: " + err?.message;
        }))).then((body: any) => {
            try {
                if (body.error) {
                    growler.error("Invalid Edge Controller: " + body.error);
                } else {
                    if (body?.data?.apiVersions?.edge?.v1 != null) {
                        this.apiVersions = body.data.apiVersions;
                        let found = false;
                        if (this.settings.edgeControllers?.length > 0) {
                            for (let i = 0; i < this.settings.edgeControllers.length; i++) {
                                if (this.settings.edgeControllers[i].url == url) {
                                    found = true;
                                    this.settings.edgeControllers[i].name = name;
                                    this.settings.edgeControllers[i].url = url;
                                    break;
                                }
                            }
                        }
                        if (!found) {
                            let isDefault = false;
                            if (!this.settings.edgeControllers) this.settings.edgeControllers = [];
                            if (this.settings.edgeControllers?.length === 0) isDefault = true;
                            this.settings.edgeControllers.push({
                                name: name,
                                url: url,
                                default: isDefault
                            });
                        }
                        this.settings.selectedEdgeController = url;
                        this.set(this.settings);

                    } else {
                        growler.error("Invalid Edge Controller: " + JSON.stringify(body));
                    }
                }
            } catch (e) {
                growler.error("Invalid Edge Controller: " + e);
            }
        }).catch(err => {
            growler.error(err);
        });
    }
}
