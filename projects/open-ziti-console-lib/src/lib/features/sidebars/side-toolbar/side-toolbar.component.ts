import { Component } from '@angular/core';
import {SettingsService} from "../../../services/settings.service";

import {cloneDeep} from 'lodash';
import { Router } from '@angular/router';


@Component({
  selector: 'lib-side-toolbar',
  templateUrl: './side-toolbar.component.html',
  styleUrls: ['./side-toolbar.component.scss']
})
export class SideToolbarComponent {
  hideNav:boolean | undefined;
  constructor(private settingsService: SettingsService, private router: Router) {}

  ngOnInit() {
    this.settingsService.settingsChange.subscribe((results:any) => {
      this.hideNav = results.hideNav;
    });
  }
  toggleNav() {
    this.hideNav = !this.hideNav;
    const settings = {
      ...this.settingsService.settings, hideNav: this.hideNav
    }
    this.settingsService.set(settings);
  }

  doLogout() {
    localStorage.removeItem('ziti.settings');
    if (this.settingsService.useNodeServer) {
      this.settingsService.clearNodeSession();
    } else {
      this.settingsService.settings.session.id = undefined;
      this.settingsService.set(this.settingsService.settings);
      this.router.navigate(['/login']);
    }
  }

}
