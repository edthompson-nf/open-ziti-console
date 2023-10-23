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
import {ZacWrapperServiceClass, ZAC_WRAPPER_SERVICE} from "../../features/wrappers/zac-wrapper-service.class";
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
      @Inject(ZAC_WRAPPER_SERVICE)private zacWrapperService: ZacWrapperServiceClass
  ) {
    super(filterService, svc);
  }

  override ngOnInit() {
    this.tabs = this.tabNames.getTabs('identities');
    this.svc.refreshData = this.refreshData;
    this.zacWrapperService.zitiUpdated.subscribe(() => {
      this.refreshData();
    });
    this.zacWrapperService.resetZacEvents();
    this.getIdentityRoleAttributes();
    super.ngOnInit();
  }

  headerActionClicked(action: string) {
    switch(action) {
      case 'add':
        this.svc.openUpdate();
        break;
      case 'edit':
        this.svc.openUpdate();
        break;
      case 'delete':
        const selectedItems = this.rowData.filter((row) => {
          return row.selected;
        }).map((row) => {
          return row.id;
        });
        this.openBulkDelete(selectedItems);
        break;
      default:
    }
  }

  closeModal(event?) {
    this.svc.modalOpen = false;
    if(event?.refresh) {
      this.refreshData();
      this.getIdentityRoleAttributes();
    }
  }

  dataChanged(event) {
    this.formDataChanged = event;
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
        this.svc.openUpdate(event.item);
        break;
      case 'create':
        this.svc.openUpdate();
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
      case 'download-all':
        this.svc.downloadAllItems();
        break;
      case 'download-selected':
        this.svc.downloadItems(this.selectedItems);
        break;
      default:
        break;
    }
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
    this.openBulkDelete([item.id]);
  }

  getIdentityRoleAttributes() {
    this.svc.getIdentitiesRoleAttributes().then((result: any) => {
      this.identityRoleAttributes = result.data;
    });
  }

  canDeactivate() {
    if (this.formDataChanged && this.svc.modalOpen) {
      return confirm('You have unsaved changes. Do you want to leave this page and discard your changes or stay on this page?');
    }
    return true;
  }
}
