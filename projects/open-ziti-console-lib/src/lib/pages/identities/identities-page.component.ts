import {Component, OnInit} from '@angular/core';
import {SettingsService} from "../../services/settings.service";
import {IdentitiesService} from "./identities.service";
import {TableColumnDefaultComponent} from "../../features/data-table/column-headers/table-column-default/table-column-default.component";
import moment from 'moment';
import {DataTableFilterService} from "../../features/data-table/data-table-filter.service";

@Component({
  selector: 'lib-identities',
  templateUrl: './identities-page.component.html',
  styleUrls: ['./identities-page.component.scss']
})
export class IdentitiesPageComponent implements OnInit {
  title = 'Identity Management'
  tabs: { url: string, label: string }[] = [
    {label: 'Identities', url:'/ziti-identities'},
    {label: 'Recipes', url:'/recipes'},
    {label: 'Terminators', url:'/config-terminators'},
    {label: 'Posture Checks', url:'/config-posture-checks'},
  ];

  startCount = '-';
  endCount = '-';
  totalCount = '-';
  itemsSelected = false;
  columnDefs: any = [];
  rowData = [];
  filterApplied = false;

  constructor(
    private settings: SettingsService,
    private svc: IdentitiesService,
    private filterService: DataTableFilterService,
  ) {
    this.initTableColumns();
  }

  ngOnInit() {
    this.filterService.clearFilters();
    this.filterService.filtersChanged.subscribe(filters => {
      this.filterApplied = filters && filters.length > 0;
      this.svc.getIdentities(filters).then((data: any) => {
        this.rowData = data.data
        this.startCount = 1 + '';
        this.endCount = data.meta.pagination.totalCount;
        this.totalCount = data.meta.pagination.totalCount;
      });
    });
  }

  initTableColumns() {
    const headerComponentParams = {
      filterType: 'TEXTINPUT',
      enableSorting: true
    };
    const nameRenderer = (row) => {
      return `<div class="col" data-id="${row?.data?.id}">
                <span class="circle ${row?.data?.hasApiSession}" title="Api Session"></span>
                <span class="circle ${row?.data?.hasEdgeRouterConnection}" title="Edge Router Connected"></span>
                <strong>${row?.data?.name}</strong>
              </div>`
    }

    const osRenderer = (row) => {
      let os = "other";
      let osDetails = "";
      if (row?.data?.envInfo) {
        if (row?.data?.envInfo?.osVersion&&row?.data?.envInfo?.osVersion.toLowerCase().indexOf("windows")>=0) os = "windows";
        else {
          if (row?.data?.envInfo?.os&&row?.data?.envInfo?.os.toLowerCase().indexOf("darwin")>=0) os = "apple";
          else if (row?.data?.envInfo?.os&&row?.data?.envInfo?.os.toLowerCase().indexOf("linux")>=0) os = "linux";
          else if (row?.data?.envInfo?.os&&row?.data?.envInfo?.os.toLowerCase().indexOf("android")>=0) os = "android";
          else if (row?.data?.envInfo?.os&&row?.data?.envInfo?.os.toLowerCase().indexOf("windows")>=0) os = "windows";
        }
        if (row?.data?.envInfo?.os) osDetails += "OS: "+row?.data?.envInfo?.os;
        if (row?.data?.envInfo?.arch) osDetails += "&#10;Arch: "+row?.data?.envInfo?.arch;
        if (row?.data?.envInfo?.osRelease) osDetails += "&#10;Release: "+row?.data?.envInfo?.osRelease;
        if (row?.data?.envInfo?.osVersion) osDetails += "&#10;Version: "+row?.data?.envInfo?.osVersion;
      }
      return `<div class="col desktop" data-id="${row?.data?.id}" style="overflow: unset;">
                <span class="os ${os}" data-balloon-pos="up" aria-label="${osDetails}"></span>
              </div>`
    }

    const sdkRenderer = (row) => {
      let sdk = "";
      let version = "-";
      const sdkInfo = row?.data?.sdkInfo;
      if (sdkInfo) {
        version = "";
        if (sdkInfo?.version) version += sdkInfo?.version;
        if (sdkInfo?.appId) sdk += sdkInfo?.appId;
        if (sdkInfo?.appVersion) sdk += sdkInfo?.appVersion;
        if (sdkInfo?.type) sdk += sdkInfo?.type;
        if (sdkInfo?.type) sdk += "&#10;"+sdkInfo?.branch;
        if (sdkInfo?.revision) sdk += " - "+sdkInfo?.revision;
      }
      return`<div class="col desktop" data-id="${row?.data?.id}" style="overflow: unset;" data-balloon-pos="up" aria-label="${sdk}">
                <span class="oneline">${version}</span>
             </div>`;
    }

    const tokenRenderer = (row) => {
      let enrollment = "N/A";
      const enrollmentData = row?.data?.enrollment;
      if (enrollmentData&&enrollmentData?.ott&&enrollmentData?.ott?.jwt) {
        if (enrollmentData?.ott?.expiresAt!=null) {
          const difference = moment(enrollmentData?.ott?.expiresAt).diff(moment(new Date()));
          if (difference>0) enrollment = '<span class="cert" data-id="'+row?.data?.id+'"></span><span class="qr icon-qr" data-id="'+row?.data?.id+'"></span>';
        } else {
          enrollment = '<span class="cert" data-id="'+row?.data?.id+'"></span><span class="qr icon-qr" data-id="'+row?.data?.id+'"></span>';
        }
        enrollment = `<div class="gridAction">${enrollment}</div>`
      } else {
        if (enrollmentData?.updb) {
          if (enrollmentData?.updb?.expiresAt!=null) {
            const difference = moment(enrollmentData?.updb?.expiresAt).diff(moment(new Date()));
            if (difference>0) enrollment = '<span class="cert" data-id="'+row?.data?.id+'"></span><span class="qr icon-qr" data-id="'+row?.data?.id+'"></span>';
          } else {
            enrollment = '<span class="cert" data-id="'+row?.data?.id+'"></span><span class="qr icon-qr" data-id="'+row?.data?.id+'"></span>';
          }
          enrollment = `<div class="gridAction">${enrollment}</div>`
        }
      }

      return `<div class="col desktop notitle">${enrollment}</div>`
    };

    const createdAtFormatter = (row) => {
      return moment(row?.data?.createdAt).local().format('M/D/YYYY H:MM A');
    }

    this.columnDefs = [
      {
        colId: 'name',
        field: 'name',
        headerName: 'Name',
        headerComponent: TableColumnDefaultComponent,
        headerComponentParams,
        resizable: true,
        cellRenderer: nameRenderer,
        cellClass: 'nf-cell-vert-align tCol',
        sortable: true,
        filter: true,
        sortColumn: this.sort.bind(this)
      },
      {
        colId: 'os',
        field: 'os',
        headerName: 'O/S',
        width: 100,
        cellRenderer: osRenderer,
        headerComponent: TableColumnDefaultComponent,
        headerComponentParams,
        resizable: true,
        cellClass: 'nf-cell-vert-align tCol',
      },
      {
        colId: 'sdk',
        field: 'sdk',
        headerName: 'SDK',
        cellRenderer: sdkRenderer,
        headerComponent: TableColumnDefaultComponent,
        headerComponentParams,
        resizable: true,
        cellClass: 'nf-cell-vert-align tCol',
      },
      {
        colId: 'type',
        field: 'type.name',
        headerName: 'Type',
        headerComponent: TableColumnDefaultComponent,
        headerComponentParams,
        resizable: true,
        cellClass: 'nf-cell-vert-align tCol',
      },
      {
        colId: 'isAdmin',
        field: 'isAdmin',
        headerName: 'Is Admin',
        headerComponent: TableColumnDefaultComponent,
        headerComponentParams,
        resizable: true,
        cellClass: 'nf-cell-vert-align tCol',
      },
      {
        colId: 'createdAt',
        field: 'createdAt',
        headerName: 'Created At',
        headerComponent: TableColumnDefaultComponent,
        headerComponentParams,
        valueFormatter: createdAtFormatter,
        resizable: true,
        cellClass: 'nf-cell-vert-align tCol',
      },
      {
        colId: 'token',
        field: 'token',
        headerName: 'Token',
        headerComponent: TableColumnDefaultComponent,
        headerComponentParams,
        cellRenderer: tokenRenderer,
        resizable: true,
        cellClass: 'nf-cell-vert-align tCol',
      }
    ];
  }

  tableAction(event) {
    switch(event?.action) {
      case 'toggleAll':
      case 'toggleItem':
        this.itemToggled(event.item)
        break;
      case 'update':
        this.editItem(event.item)
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

  itemToggled(item: any) {
    let itemSelected = false;
    this.rowData.forEach((item) => {
      if (item.selected) {
        itemSelected = true;
      }
    });
    this.itemsSelected = itemSelected;
  }

  editItem(item: any) {
    window['page']['edit'](item.id);
  }

  getOverrides(item: any) {
    window['page']['getOverrides'](item.id);
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

  private openUpdate() {

  }

  private openBulkDelete(selectedItems: any[]) {

  }

  sort(sortBy, ordering= 'desc') {
    this.svc.getIdentities(this.filterService.filters, {sortBy, ordering})
        .then((data: any) => {
      this.rowData = data.data
      this.startCount = 1 + '';
      this.endCount = data.meta.pagination.totalCount;
      this.totalCount = data.meta.pagination.totalCount;
    });
  }
}
