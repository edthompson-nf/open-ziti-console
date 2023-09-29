import {Injectable} from "@angular/core";
import {isEmpty} from 'lodash';
import moment from 'moment';
import {DataTableFilterService, FilterObj} from "../../features/data-table/data-table-filter.service";
import {ListPageServiceClass} from "../../shared/list-page-service.class";
import {
    TableColumnDefaultComponent
} from "../../features/data-table/column-headers/table-column-default/table-column-default.component";
import {CallbackResults} from "../../features/list-page-features/list-page-form/list-page-form.component";
import {SettingsService} from "../../services/settings.service";
import {ZitiDataService} from "../../services/ziti-data.service";

@Injectable({
    providedIn: 'root'
})
export class IdentitiesPageService extends ListPageServiceClass {

    private paging = this.DEFAULT_PAGING;

    columnFilters: any = {
        name: '',
        os: '',
        createdAt: '',
    };

    override menuItems = [
        {name: 'Edit', action: 'update'},
        {name: 'Download JWT', action: 'download-enrollment'},
        {name: 'View QR', action: 'qr-code'},
        {name: 'Override', action: 'override'},
        {name: 'Delete', action: 'delete'},
    ]

    constructor(
        settings: SettingsService,
        filterService: DataTableFilterService,
        private zitiService: ZitiDataService
    ) {
        super(settings, filterService);
    }

    validate = (formData): Promise<CallbackResults> => {
        return Promise.resolve({ passed: true});
    }

    initTableColumns(): any {
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

        const columnFilters = this.columnFilters;

        const osParams = {
            filterType: 'COMBO',
            filterOptions: [
                { label: 'All', value: '', icon: 'empty' },
                { label: 'Apple', value: 'darwin', icon: 'apple' },
                { label: 'Windows', value: 'mingw', icon: 'windows'  },
                { label: 'Linux', value: 'linux', icon: 'linux'  },
                { label: 'Android', value: 'android', icon: 'android'  },
                { label: 'Other (text search)', value: '', icon: 'other', useTextInput: true  },
            ],
            columnFilters,
        };

        return [
            {
                colId: 'name',
                field: 'name',
                headerName: 'Name',
                headerComponent: TableColumnDefaultComponent,
                headerComponentParams: this.headerComponentParams,
                resizable: true,
                cellRenderer: nameRenderer,
                cellClass: 'nf-cell-vert-align tCol',
                sortable: true,
                filter: true,
                sortColumn: this.sort.bind(this),
                sortDir: 'asc'
            },
            {
                colId: 'os',
                field: 'os',
                headerName: 'O/S',
                width: 100,
                cellRenderer: osRenderer,
                headerComponent: TableColumnDefaultComponent,
                headerComponentParams: osParams,
                resizable: true,
                cellClass: 'nf-cell-vert-align tCol',
            },
            {
                colId: 'sdk',
                field: 'sdk',
                headerName: 'SDK',
                cellRenderer: sdkRenderer,
                headerComponent: TableColumnDefaultComponent,
                headerComponentParams: this.headerComponentParams,
                resizable: true,
                cellClass: 'nf-cell-vert-align tCol',
            },
            {
                colId: 'type',
                field: 'type.name',
                headerName: 'Type',
                headerComponent: TableColumnDefaultComponent,
                headerComponentParams: this.headerComponentParams,
                resizable: true,
                sortable: true,
                cellClass: 'nf-cell-vert-align tCol',
                sortColumn: this.sort.bind(this),
            },
            {
                colId: 'isAdmin',
                field: 'isAdmin',
                headerName: 'Is Admin',
                headerComponent: TableColumnDefaultComponent,
                headerComponentParams: this.headerComponentParams,
                resizable: true,
                cellClass: 'nf-cell-vert-align tCol',
            },
            {
                colId: 'createdAt',
                field: 'createdAt',
                headerName: 'Created At',
                headerComponent: TableColumnDefaultComponent,
                headerComponentParams: this.headerComponentParams,
                valueFormatter: createdAtFormatter,
                resizable: true,
                cellClass: 'nf-cell-vert-align tCol',
            },
            {
                colId: 'token',
                field: 'token',
                headerName: 'Token',
                headerComponent: TableColumnDefaultComponent,
                cellRenderer: tokenRenderer,
                resizable: true,
                cellClass: 'nf-cell-vert-align tCol',
            }
        ];
    }

    getData(filters?: FilterObj[], sort?: any): Promise<any> {
        // we can customize filters or sorting here before moving on...
        return super.getTableData('identities', this.paging, filters, sort)
            .then((results: any) => {
                return this.processData(results);
            });
    }

    private processData(results: any) {
        if (!isEmpty(results?.data)) {
            //pre-process data before rendering
            results.data = this.addActionsPerRow(results);
        }
        return results;
    }

    private addActionsPerRow(results: any): any[] {
        return results.data.map((row) => {
            row.actionList = ['update', 'override', 'delete'];
            if (row?.enrollment?.ott) {
                if (row?.enrollment?.ott?.expiresAt) {
                    const difference = moment(row?.enrollment?.ott?.expiresAt).diff(moment(new Date()));
                    if (difference > 0) {
                        row.actionList.push('download-enrollment');
                        row.actionList.push('qr-code');
                    }
                } else {
                    row.actionList.push('download-enrollment');
                    row.actionList.push('qr-code');
                }
            } else if (row?.enrollment?.updb) {
                if (row?.enrollment?.updb?.expiresAt != null) {
                    const difference = moment(row?.enrollment?.updb?.expiresAt).diff(moment(new Date()));
                    if (difference > 0) {
                        row.actionList.push('download-enrollment');
                        row.actionList.push('qr-code');
                    }
                } else {
                    row.actionList.push('download-enrollment');
                    row.actionList.push('qr-code');
                }
            }
            return row;
        });
    }

    public getIdentitiesRoleAttributes() {
        return this.zitiService.get('identity-role-attributes', this.DEFAULT_PAGING);
    }
}
