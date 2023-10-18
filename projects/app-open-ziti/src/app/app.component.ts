import {Component, OnInit, Inject} from '@angular/core';
import {SettingsServiceClass, SETTINGS_SERVICE, ZITI_DOMAIN_CONTROLLER} from "open-ziti-console-lib";
import { SimpleZitiDomainControllerService} from './services/simple-ziti-domain-controller.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    title = 'Open Ziti Console';
    version = '';
    isAuthorized = false;
    displayNav = true;
    displayTool = true;
    showModal = false;
    loading = true;

    constructor(@Inject(SETTINGS_SERVICE) private settingsService: SettingsServiceClass, @Inject(ZITI_DOMAIN_CONTROLLER) private zitiControllerService: SimpleZitiDomainControllerService, private router: Router) {}

    ngOnInit() {
        this.loading = true;
        this.settingsService.settingsChange.subscribe((results:any) => {
            this.version = results.version;
            this.displayNav = !results.hideNav ?? true;
            this.displayTool = !results.hideTool ?? true;
            this.isAuthorized = results.session?.id;
            this.loading = false;
            this.checkForValidNodeSession();
        });
    }

    async checkForValidNodeSession() {
        if (this.settingsService.hasSession()) {
            this.isAuthorized = true;
            return Promise.resolve();
        } else {
            this.router.navigate(['/login']);
            return Promise.resolve();
        }
    }
}
