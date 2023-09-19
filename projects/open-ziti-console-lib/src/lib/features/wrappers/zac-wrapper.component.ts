import {Component, Inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ZAC_WRAPPER_SERVICE, ZacWrapperService} from "./zac-wrapper.service";
import {delay, invoke, isEmpty, defer, set} from 'lodash';
import {Subscription} from "rxjs";
import {SettingsService} from "../../services/settings.service";

import $ from 'jquery';

@Component({
    selector: 'app-zac-wrapper',
    templateUrl: './zac-wrapper.component.html',
    styleUrls: ['./zac-wrapper.component.scss'],
})
export class ZacWrapperComponent implements OnInit, OnDestroy {

  loading = false;
  pageHtml: any = '';
  subscription = new Subscription();
  title = 'Ziti Console';
  waitingForSession = true;
  pageLoading = false;
  @ViewChild('zacContainer') zacContainer: any;

  constructor(
      @Inject(ZAC_WRAPPER_SERVICE) private wrapperService: ZacWrapperService,
      private settingsService: SettingsService,
  ) {
  }

  ngOnInit(): void {
    this.loading = true;
    this.wrapperService.initZac();
    this.subscription.add(
    this.wrapperService.pageChanged.subscribe(() => {
      if (this.waitingForSession) {
        return;
      }
      this.loadPage();
    }));
    this.settingsService.settingsChange.subscribe((results:any) => {
        if (!isEmpty(this.settingsService?.settings?.session?.id)) {
          if (this.waitingForSession && !this.pageLoading) {
              this.pageLoading = true;
              delay(async () => {
                await this.loadPage();
                this.waitingForSession = false;
                this.pageLoading = false;
              }, 200)
          }
        }
    });
    this.initZACButtonListener();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.pageHtml = undefined;
  }

  async loadPage() {
    this.loading = true;
    this.pageHtml = await this.wrapperService.loadCurrentPage();
    defer(() => {
      this.executePageScripts();
    });
  }

  executePageScripts() {
    const scripts = this.zacContainer.nativeElement.getElementsByTagName('script');
    for (const script of scripts) {
      const scriptCopy = <HTMLScriptElement>document.createElement('script');
      scriptCopy.type = script.type ? script.type : 'text/javascript';
      if (script.innerHTML) {
        scriptCopy.innerHTML = script.innerHTML;
      } else if (script.src) {
        scriptCopy.src = script.src;
      }
      scriptCopy.async = false;
      script.parentNode.replaceChild(scriptCopy, script);
    }
    setTimeout(() => {
      set(window, 'context.items', []);
      set(window, 'context.watchers', []);
      set(window, 'context.eventWatchers', []);
      invoke(window, 'app.init');
      this.loading = false;
    }, 50);
  }

  initZACButtonListener() {
    $('.action.icon-plus.icon-add, #HelpButton').off('click.zacAddButtonClicked');
    $('.action.icon-plus.icon-add, #HelpButton').on('click.zacAddButtonClicked', (event) => {
      if ($(event.currentTarget).hasClass('icon-minus')) {
        return;
      }
      $('body').addClass('updateModalOpen');
    });
    $('.modal .close, .modal .closer').off('click.zacCloseButtonClicked');
    $('.modal .close, .modal .closer').on('click.zacCloseButtonClicked', () => {
      $('body').removeClass('updateModalOpen');
    });
    delay(() => {
      this.initZACButtonListener();
    }, 50);
  }
}
