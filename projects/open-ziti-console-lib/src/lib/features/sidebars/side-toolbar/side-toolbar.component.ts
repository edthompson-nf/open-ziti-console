import { Component } from '@angular/core';
import {SettingsService} from "../../../services/settings.service";

import {cloneDeep} from 'lodash';
import { Router } from '@angular/router';
import { ZacWrapperService } from '../../wrappers/zac-wrapper.service';


@Component({
  selector: 'lib-side-toolbar',
  templateUrl: './side-toolbar.component.html',
  styleUrls: ['./side-toolbar.component.scss']
})
export class SideToolbarComponent {
  hideNav:boolean | undefined;
  menuOpen = false;
  sideBarInit = false;
  constructor(private settingsService: SettingsService, private router: Router, private zacService: ZacWrapperService) {}

  ngOnInit() {
    this.zacService.initZac();
    this.zacService.initZACButtonListener();
    this.settingsService.settingsChange.subscribe((results:any) => {
      this.hideNav = results.hideNav;
      this.initSideBar();
    });
  }

  initSideBar() {
    if (this.sideBarInit) {
      return;
    }
    window['header'].init();
    window['locale'].init();
    window['modal'].init();
    this.sideBarInit = true;
  }

  toggleNav() {
    this.hideNav = !this.hideNav;
    const settings = {
      ...this.settingsService.settings, hideNav: this.hideNav
    }
    this.settingsService.set(settings);
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu() {
    this.menuOpen = false;
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
