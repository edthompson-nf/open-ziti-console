import { Injectable, Inject } from '@angular/core';
import { Router } from "@angular/router";
import {LoggerService} from "../features/messaging/logger.service";
import {GrowlerService} from "../features/messaging/growler.service";
import {SETTINGS_SERVICE, SettingsService} from "./settings.service";
import {firstValueFrom, map, Observable} from "rxjs";
import {catchError} from "rxjs/operators";
import {HttpClient} from "@angular/common/http";
import {FilterObj} from "../features/data-table/data-table-filter.service";
import {isEmpty, get} from "lodash";
import {ZitiDataService} from "./ziti-data.service";

@Injectable({
    providedIn: 'root'
})
export class ZitiControllerDataService extends ZitiDataService {

    DEFAULT_PAGING: any = {
        filter: "",
        noSearch: true,
        order: "asc",
        page: 1,
        searchOn: "name",
        sort: "name",
        total: 100
    }

    constructor(override logger: LoggerService,
                override growler: GrowlerService,
                @Inject(SETTINGS_SERVICE) settingsService: SettingsService,
                override httpClient: HttpClient,
                override router: Router
    ) {
        super(logger, growler, settingsService, httpClient, router);
    }

    post(type, model): Promise<any> {
        const apiVersions = this.settingsService.apiVersions || {};
        const prefix = apiVersions["edge-management"]?.v1?.path;
        const url = this.settingsService.settings.selectedEdgeController;
        const serviceUrl = url + prefix + "/" + type;

        return firstValueFrom(this.httpClient.post(serviceUrl, model, {}).pipe(
                catchError((err: any) => {
                    const error = "Server Not Accessible";
                    if (err.code !== "ECONNREFUSED") throw(err);
                    throw({error: error});
                }),
                map((result: any) => {
                    return result;
                })
            )
        );
    }

    patch(type, model, id): Promise<any> {
        const apiVersions = this.settingsService.apiVersions || {};
        const prefix = apiVersions["edge-management"]?.v1?.path || '/edge/management/v1';
        const url = this.settingsService.settings.selectedEdgeController;
        const serviceUrl = url + prefix + "/" + type + '/' + id;
        this.httpClient.patch(serviceUrl, model, {});

        return firstValueFrom(this.httpClient.patch(serviceUrl, model, {}).pipe(
                catchError((err: any) => {
                    const error = "Server Not Accessible";
                    if (err.code !== "ECONNREFUSED") throw(err);
                    throw({error: error});
                }),
                map((result: any) => {
                    return result;
                })
            )
        );
    }

    get(type: string, paging: any, filters: FilterObj[] = []): Promise<any> {
        const apiVersions = this.settingsService.apiVersions || {};
        const prefix = apiVersions["edge-management"]?.v1?.path || '/edge/management/v1';
        const url = this.settingsService.settings.selectedEdgeController;
        const urlFilter = this.getUrlFilter(paging);
        const serviceUrl = url + prefix + "/" + type + urlFilter;

        return firstValueFrom(this.httpClient.get(serviceUrl,{}).pipe(
                catchError((err: any) => {
                    const error = "Server Not Accessible";
                    if (err.code != "ECONNREFUSED") throw({error: err.code});
                    throw({error: error});
                }),
                map((results: any) => {
                    if(filters.length > 0) {
                        filters.forEach((filter:FilterObj) => {
                            let newData: any[] = [];
                            if(filter.columnId !== 'name' && !isEmpty(filter.value )) {
                                results.data.forEach(row => {
                                    if(get(row, filter.columnId)?.indexOf(filter.value) >= 0)
                                        newData.push(row);
                                })
                                results.data = newData;
                            }
                        });
                    }
                    return results;
                })
            )
        );
    }

    getSubdata(entityType: string, id: any, dataType: string): Promise<any> {
        const apiVersions = this.settingsService.apiVersions || {};
        const prefix = apiVersions["edge-management"]?.v1?.path || '/edge/management/v1';
        const url = this.settingsService.settings.selectedEdgeController + `${prefix}/${entityType}/${id}/${dataType}`;

        return firstValueFrom(this.httpClient.get(url, {}).pipe(
                catchError((err: any) => {
                    const error = "Server Not Accessible";
                    if (err.code != "ECONNREFUSED") throw({error: err.code});
                    throw({error: error});
                })
            )
        );
    }

    delete(type: string, id: string): Promise<any> {
        const apiVersions = this.settingsService.apiVersions || {};
        const prefix = apiVersions["edge-management"]?.v1?.path;
        const url = this.settingsService.settings.selectedEdgeController;
        const serviceUrl = url + prefix + "/" + type + '/' + id;

        return firstValueFrom(this.httpClient.delete(serviceUrl, {}).pipe(
                catchError((err: any) => {
                    const error = "Server Not Accessible";
                    if (err.code != "ECONNREFUSED") throw({error: err.code});
                    throw({error: error});
                }),
                map((results: any) => {
                    return results;
                })
            )
        );
    }

    private getUrlFilter(paging: any) {
        let urlFilter = '';
        let toSearchOn = "name";
        let noSearch = false;
        if (paging && paging.sort != null) {
            if (paging.searchOn) toSearchOn = paging.searchOn;
            if (paging.noSearch) noSearch = true;
            if (!paging.filter) paging.filter = "";
            paging.filter = paging.filter.split('#').join('');
            if (noSearch) {
                if (paging.page !== -1) urlFilter = "?limit=" + paging.total + "&offset=" + ((paging.page - 1) * paging.total)  + "&sort=" + paging.sort + " " + paging.order;
            } else {
                if (paging.page !== -1) urlFilter = "?filter=(" + toSearchOn + " contains \"" + paging.filter + "\")&limit=" + paging.total + "&offset=" + ((paging.page - 1) * paging.total) + "&sort=" + paging.sort + " " + paging.order;
                if (paging.params) {
                    for (const key in paging.params) {
                        urlFilter += ((urlFilter.length === 0) ? "?" : "&") + key + "=" + paging.params[key];
                    }
                }
            }
        }
        return urlFilter;
    }

}
