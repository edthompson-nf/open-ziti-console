import {Component, Inject} from '@angular/core';
import {SettingsService, SETTINGS_SERVICE} from "../../../services/settings.service";

import {cloneDeep} from 'lodash';
import { Router } from '@angular/router';
import { ZacWrapperServiceClass } from '../../wrappers/zac-wrapper-service.class';
import {ZITI_DATA_SERVICE, ZitiDataService} from "../../../services/ziti-data.service";
import {ZAC_WRAPPER_SERVICE} from "../../wrappers/zac-wrapper-service.class";


@Component({
  selector: 'lib-side-toolbar',
  templateUrl: './side-toolbar.component.html',
  styleUrls: ['./side-toolbar.component.scss']
})
export class SideToolbarComponent {
  hideNav:boolean | undefined;
  menuOpen = false;
  sideBarInit = false;
  constructor(
      @Inject(SETTINGS_SERVICE) private settingsService: SettingsService,
      private router: Router,
      @Inject(ZAC_WRAPPER_SERVICE) private zacService: ZacWrapperServiceClass,
      @Inject(ZITI_DATA_SERVICE) private zitiService: ZitiDataService
  ) {}

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
    this.zitiService.logout();
  }
}
