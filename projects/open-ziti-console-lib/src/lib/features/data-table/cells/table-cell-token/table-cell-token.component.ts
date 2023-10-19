import { Component } from '@angular/core';
import {ICellRendererAngularComp} from "ag-grid-angular";
import {ICellRendererParams} from "ag-grid-community";

import {isEmpty} from 'lodash';
import {MatDialog} from "@angular/material/dialog";
import {QrCodeComponent} from "../../../qr-code/qr-code.component";


@Component({
  selector: 'lib-table-cell-token',
  templateUrl: './table-cell-token.component.html',
  styleUrls: ['./table-cell-token.component.scss']
})
export class TableCellTokenComponent implements ICellRendererAngularComp {

  cellParams: any;
  item: any;
  dialogRef: any;

  constructor(public dialogForm: MatDialog) {
  }

  agInit(params: ICellRendererParams): void {
    this.cellParams = params;
    this.item = params.data;
  }

  get hasEnrolmentToken() {
    return !isEmpty(this.item?.enrollment?.ott?.jwt) ||
        !isEmpty(this.item?.enrollment?.ottca?.jwt) ||
        !isEmpty(this.item?.enrollment?.updb?.jwt);
  }

  getJWT(identity: any) {
    let qrCode;
    if (!isEmpty(identity?.enrollment?.ott?.jwt)) {
      qrCode = identity?.enrollment?.ott?.jwt;
    } else if (!isEmpty(identity?.enrollment?.ottca?.jwt)) {
      qrCode = identity?.enrollment?.ottca?.jwt;
    } else if(!isEmpty(identity?.enrollment?.updb?.jwt)) {
      qrCode = identity?.enrollment?.updb?.jwt;
    }
    return qrCode;
  }

  getEnrollmentExpiration(identity: any) {
    let expiresAt;
    if (!isEmpty(identity?.enrollment?.ott?.expiresAt)) {
      expiresAt = identity?.enrollment?.ott?.expiresAt;
    } else if (!isEmpty(identity?.enrollment?.ottca?.expiresAt)) {
      expiresAt = identity?.enrollment?.ottca?.expiresAt;
    } else if(!isEmpty(identity?.enrollment?.updb?.expiresAt)) {
      expiresAt = identity?.enrollment?.updb?.expiresAt;
    }
    return expiresAt;
  }

  downloadCert() {
    const jwt = this.getJWT(this.item);
    const element = document.createElement('a');
    element.setAttribute('href', 'data:application/ziti-jwt;charset=utf-8,' + encodeURIComponent(jwt));
    element.setAttribute('download', name+".jwt");
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  showQRCode() {
    const data = {
      jwt: this.getJWT(this.item),
      expiration: this.getEnrollmentExpiration(this.item),
      qrCodeSize: 300
    };
    this.dialogRef = this.dialogForm.open(QrCodeComponent, {
      data: data,
      autoFocus: false,
    });
  }

  refresh(params: ICellRendererParams<any>): boolean {
    this.cellParams = params;
    this.item = params.data;
    return true;
  }
}
