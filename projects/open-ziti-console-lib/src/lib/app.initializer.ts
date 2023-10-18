import {Injector} from "@angular/core";
import {SettingsService, SETTINGS_SERVICE} from "./services/settings.service";

export function onAppInit(injector: Injector): () => Promise<any> {
    const svc = injector.get(SETTINGS_SERVICE, SettingsService);
    return () => svc.init();
}
