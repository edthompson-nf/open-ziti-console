import {Inject, Injectable} from '@angular/core';
import { Router } from "@angular/router";
import {LoggerService} from "../features/messaging/logger.service";
import {GrowlerService} from "../features/messaging/growler.service";
import {SETTINGS_SERVICE, SettingsService} from "./settings.service";
import {firstValueFrom, map} from "rxjs";
import {catchError} from "rxjs/operators";
import {HttpClient} from "@angular/common/http";
import {FilterObj} from "../features/data-table/data-table-filter.service";
import {isEmpty, get} from "lodash";
import {ZitiDataService} from "./ziti-data.service";

@Injectable({
    providedIn: 'root'
})
export class NodeDataService extends ZitiDataService {

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
                @Inject(SETTINGS_SERVICE) override settingsService: SettingsService,
                override httpClient: HttpClient,
                override router: Router
                ) {
        super(logger, growler, settingsService, httpClient, router)
    }

    post(type, model) {
        let clientSub;
        const nodeServerURL = this.settingsService.settings.protocol + '://' + this.settingsService.settings.host + ':' + this.settingsService.settings.port;
        const serviceUrl = nodeServerURL + '/api/dataSave';
        const body = {paging: this.DEFAULT_PAGING, type: type, save: model};

        return firstValueFrom(this.httpClient.post(serviceUrl,body,{}).pipe(
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

    patch(type, model, id) {
        let clientSub;
        const nodeServerURL = this.settingsService.settings.protocol + '://' + this.settingsService.settings.host + ':' + this.settingsService.settings.port;
        const serviceUrl = nodeServerURL + '/api/dataSave';
        const body = {paging: this.DEFAULT_PAGING, type: type, save: model, id: id};

        return firstValueFrom(this.httpClient.post(serviceUrl,body,{}).pipe(
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

    get(type: string, paging: any, filters: FilterObj[] = []) {
        const nodeServerURL = this.settingsService.settings.protocol + '://' + this.settingsService.settings.host + ':' + this.settingsService.settings.port;
        const serviceUrl = nodeServerURL + '/api/data';
        const body = {paging: paging, type: type, filters: filters};

        return firstValueFrom(this.httpClient.post(serviceUrl,body,{}).pipe(
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

    getSubdata(entityType: string, id: any, dataType: string) {
        const nodeServerURL = this.settingsService.settings.protocol + '://' + this.settingsService.settings.host + ':' + this.settingsService.settings.port;
        const serviceUrl = nodeServerURL + '/api/subdata';
        const body = {url:`./${entityType}/${id}/${dataType}`, name: entityType, type: dataType };
        return firstValueFrom(this.httpClient.post(serviceUrl, body, {}).pipe(
                catchError((err: any) => {
                    const error = "Server Not Accessible";
                    if (err.code != "ECONNREFUSED") throw({error: err.code});
                    throw({error: error});
                })
            )
        );
    }

    delete(type: string, id: string) {
        const nodeServerURL = this.settingsService.settings.protocol + '://' + this.settingsService.settings.host + ':' + this.settingsService.settings.port;
        const serviceUrl = nodeServerURL + '/api/delete';
        const body = {paging: this.DEFAULT_PAGING, type: type, ids: [id]};

        return firstValueFrom(this.httpClient.post(serviceUrl,body,{}).pipe(
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
