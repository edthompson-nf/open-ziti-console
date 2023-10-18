import {Injectable, Inject, InjectionToken} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {SettingsServiceClass, GrowlerService, GrowlerModel, SETTINGS_SERVICE} from "open-ziti-console-lib";
import {Router} from "@angular/router";

export const LOGIN_SERVICE = new InjectionToken<any>('LOGIN_SERVICE');

export abstract class LoginServiceClass {

    abstract login(prefix: string, url: string, username: string, password: string);
    abstract observeLogin(serviceUrl: string, username: string, password: string);

    constructor(
        protected httpClient: HttpClient,
        @Inject(SETTINGS_SERVICE) protected settingsService: SettingsServiceClass,
        protected router: Router,
        protected growlerService: GrowlerService
    ) {}
}