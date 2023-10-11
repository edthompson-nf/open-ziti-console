import {Component, OnInit} from '@angular/core';
import {SettingsService} from "open-ziti-console-lib";
import { SimpleZitiDomainControllerService } from './services/simple-ziti-domain-controller.service';
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
    useNodeServer = false;
    constructor(private settingsService: SettingsService, private zitiControllerService: SimpleZitiDomainControllerService, private router: Router) {}

    ngOnInit() {
        this.loading = true;
        this.settingsService.settingsChange.subscribe((results:any) => {
            this.version = results.version;
            this.displayNav = !results.hideNav ?? true;
            this.displayTool = !results.hideTool ?? true;
            if (results.useNodeServer) {
                this.checkForValidNodeSession().finally(() => {
                    this.loading = false;
                });
            } else {
                this.isAuthorized = results.session?.id;
                this.loading = false;
            }
        });
    }
 
    async checkForValidNodeSession() {
        const sessionValid: boolean = await this.zitiControllerService.hasNodeSession();
        if (sessionValid) {
            this.isAuthorized = true;
            return Promise.resolve();
        } else {
            this.router.navigate(['/login']);
            return Promise.resolve();
        }
    }
}
