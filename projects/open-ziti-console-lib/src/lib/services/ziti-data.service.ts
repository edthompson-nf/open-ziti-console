import { Injectable } from '@angular/core';
import {LoggerService} from "../features/messaging/logger.service";
import {GrowlerService} from "../features/messaging/growler.service";
import {SettingsService} from "./settings.service";
import {firstValueFrom, map} from "rxjs";
import {catchError} from "rxjs/operators";
import {HttpClient} from "@angular/common/http";
import {FilterObj} from "../features/data-table/data-table-filter.service";
import _ from "lodash";

@Injectable({
  providedIn: 'root'
})
export class ZitiDataService {

  DEFAULT_PAGING: any = {
    filter: "",
    noSearch: true,
    order: "asc",
    page: 1,
    searchOn: "name",
    sort: "name",
    total: 100
  }

  constructor(private logger: LoggerService,
              private growler: GrowlerService,
              private settingsService: SettingsService,
              private httpClient: HttpClient) {

  }

  post(type, model) {
    let clientSub;
    if (this.settingsService.settings.useNodeServer) {
      const nodeServerURL = this.settingsService.settings.protocol + '://' + this.settingsService.settings.host + ':' + this.settingsService.settings.port;
      const serviceUrl = nodeServerURL + '/api/dataSave';
      const body = {paging: this.DEFAULT_PAGING, type: type, save: model};
      clientSub = this.httpClient.post(serviceUrl,body,{});
    } else {
      const apiVersions = this.settingsService.apiVersions;
      const prefix = apiVersions["edge-management"].v1.path;
      const url = this.settingsService.settings.selectedEdgeController;
      const serviceUrl = url + prefix + "/" + type;
      clientSub = this.httpClient.post(serviceUrl, model, {});
    }

    return firstValueFrom(clientSub.pipe(
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
    if (this.settingsService.settings.useNodeServer) {
      const nodeServerURL = this.settingsService.settings.protocol + '://' + this.settingsService.settings.host + ':' + this.settingsService.settings.port;
      const serviceUrl = nodeServerURL + '/api/dataSave';
      const body = {paging: this.DEFAULT_PAGING, type: type, save: model, id: id};
      clientSub = this.httpClient.post(serviceUrl,body,{});
    } else {
      const apiVersions = this.settingsService.apiVersions;
      const prefix = apiVersions["edge-management"]?.v1?.path || '/edge/management/v1';
      const url = this.settingsService.settings.selectedEdgeController;
      const serviceUrl = url + prefix + "/" + type + '/' + id;
      clientSub = this.httpClient.patch(serviceUrl, model, {});
    }

    return firstValueFrom(clientSub.pipe(
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
    let clientSub;
    if (this.settingsService.settings.useNodeServer) {
      const nodeServerURL = this.settingsService.settings.protocol + '://' + this.settingsService.settings.host + ':' + this.settingsService.settings.port;
      const serviceUrl = nodeServerURL + '/api/data';
      const body = {paging: paging, type: type, filters: filters};
      clientSub = this.httpClient.post(serviceUrl,body,{});
    } else {
      const apiVersions = this.settingsService.apiVersions;
      const prefix = apiVersions["edge-management"]?.v1?.path || '/edge/management/v1';
      const url = this.settingsService.settings.selectedEdgeController;
      const urlFilter = this.getUrlFilter(paging);
      const serviceUrl = url + prefix + "/" + type + urlFilter;
      clientSub = this.httpClient.get(serviceUrl,{});
    }

    return firstValueFrom(clientSub.pipe(
            catchError((err: any) => {
              const error = "Server Not Accessible";
              if (err.code != "ECONNREFUSED") throw({error: err.code});
              throw({error: error});
            }),
            map((results: any) => {
              if(filters.length > 0) {
                filters.forEach((filter:FilterObj) => {
                  let newData: any[] = [];
                  if(filter.columnId !== 'name' && !_.isEmpty(filter.value )) {
                      results.data.forEach(row => {
                        if(_.get(row, filter.columnId)?.indexOf(filter.value) >= 0)
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

  delete(type: string, id: string) {
    let clientSub;
    if (this.settingsService.settings.useNodeServer) {
      const nodeServerURL = this.settingsService.settings.protocol + '://' + this.settingsService.settings.host + ':' + this.settingsService.settings.port;
      const serviceUrl = nodeServerURL + '/api/delete';
      const body = {paging: this.DEFAULT_PAGING, type: type, ids: [id]};
      clientSub = this.httpClient.post(serviceUrl,body,{});
    } else {
      const apiVersions = this.settingsService.apiVersions;
      const prefix = apiVersions["edge-management"].v1.path;
      const url = this.settingsService.settings.selectedEdgeController;
      const serviceUrl = url + prefix + "/" + type + '/' + id;
      clientSub = this.httpClient.delete(serviceUrl, {});
    }

    return firstValueFrom(clientSub.pipe(
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
