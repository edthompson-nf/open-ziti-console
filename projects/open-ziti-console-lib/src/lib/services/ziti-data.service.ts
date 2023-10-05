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


  constructor(private logger: LoggerService,
              private growler: GrowlerService,
              private settingsService: SettingsService,
              private httpClient: HttpClient) {

  }

  post(type, model) {
    const apiVersions = this.settingsService.apiVersions;
    const prefix = apiVersions["edge-management"].v1.path;
    const url = this.settingsService.settings.selectedEdgeController;
    const serviceUrl = url + prefix + "/" + type;

    return firstValueFrom(this.httpClient.post(serviceUrl,
        model, {})
      .pipe(
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
    const apiVersions = this.settingsService.apiVersions;
    const prefix = apiVersions["edge-management"].v1.path;
    const url = this.settingsService.settings.selectedEdgeController;
    const serviceUrl = url + prefix + "/" + type + '/' + id;;

    return firstValueFrom(this.httpClient.patch(serviceUrl,
      model, {})
      .pipe(
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
    const apiVersions = this.settingsService.apiVersions;
    const prefix = apiVersions["edge-management"].v1.path;
    const url = this.settingsService.settings.selectedEdgeController;
    const urlFilter = this.getUrlFilter(paging);
    const serviceUrl = url + prefix + "/" + type + urlFilter;

    return firstValueFrom(this.httpClient.get(serviceUrl,
        {})
        .pipe(
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
    const apiVersions = this.settingsService.apiVersions;
    const prefix = apiVersions["edge-management"].v1.path;
    const url = this.settingsService.settings.selectedEdgeController;
    const serviceUrl = url + prefix + "/" + type + '/' + id;

    return firstValueFrom(this.httpClient.delete(serviceUrl,
        {})
        .pipe(
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
