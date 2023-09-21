import {Component, Inject, OnInit} from '@angular/core';
import {IdentitiesPageService} from "./identities-page.service";
import {DataTableFilterService} from "../../features/data-table/data-table-filter.service";
import {ListPageComponent} from "../../shared/list-page-component.class";
import {TabNameService} from "../../services/tab-name.service";

import {invoke, isEmpty, defer} from 'lodash';
import moment from 'moment';
import $ from 'jquery';
import {ConfirmComponent} from "../../features/confirm/confirm.component";
import {MatDialog} from "@angular/material/dialog";
import {ZAC_WRAPPER_SERVICE, ZacWrapperService} from "../../features/wrappers/zac-wrapper.service";
import {SettingsService} from "../../services/settings.service";

@Component({
  selector: 'lib-identities',
  templateUrl: './identities-page.component.html',
  styleUrls: ['./identities-page.component.scss']
})
export class IdentitiesPageComponent extends ListPageComponent implements OnInit {

  title = 'Identity Management'
  tabs: { url: string, label: string }[] ;
  selectedIdentity: any = {name: 'TestIdentityName'};
  dialogRef: any;

  constructor(
      svc: IdentitiesPageService,
      filterService: DataTableFilterService,
      public dialogForm: MatDialog,
      private tabNames: TabNameService,
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
    super.ngOnInit();
  }

  headerActionClicked(action: string) {

    switch(action) {
      case 'add':
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

  closeModal() {
    this.modalOpen = false;
  }

  private openUpdate() {
    this.modalOpen = true;
    /*
    $(".adding").show();
    $(".editing").hide();
    window['modal'].show("AddModal");
    $("body").addClass('updateModalOpen');
    defer(() => {
      $(".modal .close").click(() => {
        $("body").removeClass('updateModalOpen');
      });
    });*/
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
        this.editItem(event.item)
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
        this.getQRCode(event.item)
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
    window['page']['getCert'](item);
  }

  getQRCode(item: any) {
    window['page']['genQR'](item);
  }

  deleteItem(item: any) {
    window['page']['filterObject']['delete']([item.id]);
  }

}
