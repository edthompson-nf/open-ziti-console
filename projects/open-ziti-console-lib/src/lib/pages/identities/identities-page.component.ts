import {Component, Inject, OnInit} from '@angular/core';
import {IdentitiesPageService} from "./identities-page.service";
import {DataTableFilterService} from "../../features/data-table/data-table-filter.service";
import {ListPageComponent} from "../../shared/list-page-component.class";
import {TabNameService} from "../../services/tab-name.service";

import {invoke, isEmpty, defer, unset, cloneDeep} from 'lodash';
import moment from 'moment';
import $ from 'jquery';
import {ConfirmComponent} from "../../features/confirm/confirm.component";
import {MatDialog} from "@angular/material/dialog";
import {ZAC_WRAPPER_SERVICE, ZacWrapperService} from "../../features/wrappers/zac-wrapper.service";
import {SettingsService} from "../../services/settings.service";
import {ConsoleEventsService} from "../../services/console-events.service";
import {Identity} from "../../models/identity";
import {QrCodeComponent} from "../../features/qr-code/qr-code.component";


@Component({
  selector: 'lib-identities',
  templateUrl: './identities-page.component.html',
  styleUrls: ['./identities-page.component.scss']
})
export class IdentitiesPageComponent extends ListPageComponent implements OnInit {

  title = 'Identity Management'
  tabs: { url: string, label: string }[] ;
  selectedIdentity: any = new Identity();
  dialogRef: any;
  isLoading = false;
  identityRoleAttributes: any[] = [];
  formDataChanged = false;

  constructor(
      public override svc: IdentitiesPageService,
      filterService: DataTableFilterService,
      public dialogForm: MatDialog,
      private tabNames: TabNameService,
      private consoleEvents: ConsoleEventsService,
      @Inject(ZAC_WRAPPER_SERVICE)private zacWrapperService: ZacWrapperService
  ) {
    super(filterService, svc);
  }

  override ngOnInit() {
    this.tabs = this.tabNames.getTabs('identities');
    this.svc.refreshData = this.refreshData;
    this.zacWrapperService.zitiUpdated.subscribe(() => {
      this.refreshData();
    });
    this.getIdentityRoleAttributes();
    super.ngOnInit();
  }

  headerActionClicked(action: string) {
    switch(action) {
      case 'add':
        this.openUpdate();
        break;
      case 'edit':
        this.openUpdate();
        break;
      case 'delete':
        const selectedItems = this.rowData.filter((row) => {
          return row.selected;
        }).map((row) => {
          return row.id;
        });
        this.openBulkDelete(selectedItems)
        break;
      default:
    }
  }

  closeModal(event?) {
    this.modalOpen = false;
    if(event?.refresh) {
      this.refreshData();
      this.getIdentityRoleAttributes();
    }
  }

  dataChanged(event) {
    this.formDataChanged = event;
  }

  private openUpdate(item?: any) {
    if (item) {
      this.selectedIdentity = item;
      this.selectedIdentity.badges = [];
      if (this.selectedIdentity.hasApiSession || this.selectedIdentity.hasEdgeRouterConnection) {
        this.selectedIdentity.badges.push({label: 'Online', class: 'online', circle: 'true'});
      } else {
        this.selectedIdentity.badges.push({label: 'Offline', class: 'offline', circle: 'false'});
      }
      if (this.selectedIdentity.enrollment?.ott) {
        this.selectedIdentity.badges.push({label: 'Unregistered', class: 'unreg'});
      }
      this.selectedIdentity.moreActions = [
        {name: 'open-metrics', label: 'Open Metrics'},
        {name: 'dial-logs', label: 'Dial Logs'},
        {name: 'dial-logs', label: 'View Events'},
      ];
      unset(this.selectedIdentity, '_links');
    } else {
      this.selectedIdentity = new Identity();
    }
    this.modalOpen = true;
  }

  private openBulkDelete(selectedItems: any[]) {
      const data = {
        appendId: 'DeleteIdentities',
        title: 'Delete',
        message: 'Are you sure you would like to delete the selected Identities?',
        bulletList: [],
        confirmLabel: 'Yes',
        cancelLabel: 'Cancel'
      };
      this.dialogRef = this.dialogForm.open(ConfirmComponent, {
        data: data,
        autoFocus: false,
      });
      this.dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.svc.removeItems('identities', selectedItems).then(() => {
            this.refreshData();
          });
        }
      });
  }

  tableAction(event: any) {
    switch(event?.action) {
      case 'toggleAll':
      case 'toggleItem':
        this.itemToggled(event.item)
        break;
      case 'update':
        this.openUpdate(event.item);
        break;
      case 'create':
        this.openUpdate()
        break;
      case 'override':
        this.getOverrides(event.item)
        break;
      case 'delete':
        this.deleteItem(event.item)
        break;
      case 'download-enrollment':
        this.downloadJWT(event.item)
        break;
      case 'qr-code':
        this.showQRCode(event.item)
        break;
      default:
        break;
    }
  }

  editItem(item: any) {
    window['page']['edit'](item.id);
    $("body").addClass('updateModalOpen');
    defer(() => {
      $(".modal .close").click(() => {
        $("body").removeClass('updateModalOpen');
      });
    });
  }

  getOverrides(item: any) {
    window['page']['getOverrides'](item.id);
    $("body").addClass('updateModalOpen');
    defer(() => {
      $(".modal .close").click(() => {
        $("body").removeClass('updateModalOpen');
      });
    });
  }

  downloadJWT(item: any) {
    const jwt = this.svc.getJWT(item);
    this.svc.downloadJWT(jwt);
  }

  showQRCode(item: any) {
    const data = {
      jwt: this.svc.getJWT(item),
      expiration: this.svc.getEnrollmentExpiration(item),
      qrCodeSize: 300
    };
    this.dialogRef = this.dialogForm.open(QrCodeComponent, {
      data: data,
      autoFocus: false,
    });
  }

  deleteItem(item: any) {
    window['page']['filterObject']['delete']([item.id]);
  }

  getIdentityRoleAttributes() {
    this.svc.getIdentitiesRoleAttributes().then((result: any) => {
      this.identityRoleAttributes = result.data;
    });
  }

  canDeactivate() {
    if (this.formDataChanged && this.modalOpen) {
      return confirm('You have unsaved changes. Do you want to leave this page and discard your changes or stay on this page?');
    }
    return true;
  }
}
