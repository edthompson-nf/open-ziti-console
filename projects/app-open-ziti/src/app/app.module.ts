import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppComponent} from './app.component';
import {PageNotFoundComponent} from './page-not-found/page-not-found.component';
import {HTTP_INTERCEPTORS, HttpClientModule} from "@angular/common/http";
import {LoginComponent} from './login/login.component';
import {FormsModule} from "@angular/forms";

import {
    NoopTabInterceptorService,
    OpenZitiConsoleLibModule,
    SettingsService,
    ZacWrapperService,
    GrowlerModule,
    DeactivateGuardService,
    ZAC_WRAPPER_SERVICE,
    ZITI_DOMAIN_CONTROLLER,
    ZITI_NAVIGATOR,
    ZITI_TAB_OVERRIDES,
    ZITI_URLS,
    DEACTIVATE_GUARD
} from "open-ziti-console-lib";

import {AppRoutingModule} from "./app-routing.module";
import {SimpleZitiDomainControllerService} from "./services/simple-ziti-domain-controller.service";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {MatDialogModule} from "@angular/material/dialog";
import {URLS} from "./app-urls.constants";
import {OPEN_ZITI_NAVIGATOR} from "./app-nav.constants";
import {ZitiApiInterceptor} from "./interceptors/ziti-api.interceptor";
import {LoggerModule, NgxLoggerLevel} from "ngx-logger";
import {ErrorInterceptor} from "./interceptors/error-handler.interceptor";
import {LoggingInterceptor} from "./interceptors/logging.interceptor";

@NgModule({
    declarations: [
        AppComponent,
        PageNotFoundComponent,
        LoginComponent,
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        MatDialogModule,
        HttpClientModule,
        AppRoutingModule,
        OpenZitiConsoleLibModule,
        GrowlerModule,
        LoggerModule.forRoot({level: NgxLoggerLevel.DEBUG, serverLogLevel: NgxLoggerLevel.ERROR}),
    ],
    exports: [],
    providers: [
        {provide: ZITI_DOMAIN_CONTROLLER, useClass: SimpleZitiDomainControllerService},
        {provide: ZAC_WRAPPER_SERVICE, useClass: ZacWrapperService},
        {provide: ZITI_URLS, useValue: URLS},
        {provide: ZITI_NAVIGATOR, useValue: OPEN_ZITI_NAVIGATOR},
        {provide: ZITI_TAB_OVERRIDES, useClass: NoopTabInterceptorService},
        {provide: HTTP_INTERCEPTORS, useClass: ZitiApiInterceptor, multi: true},
        {provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true},
        {provide: HTTP_INTERCEPTORS, useClass: LoggingInterceptor, multi: true},
        {provide: DEACTIVATE_GUARD, useClass: DeactivateGuardService}
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
