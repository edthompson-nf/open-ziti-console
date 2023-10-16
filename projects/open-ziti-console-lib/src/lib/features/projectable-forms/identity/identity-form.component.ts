import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  OnChanges,
  SimpleChanges,
  ViewChild,
  ElementRef,
  AfterViewInit
} from '@angular/core';
import {ProjectableForm} from "../projectable-form.class";
import {SettingsService} from "../../../services/settings.service";

import {isEmpty, forEach, delay, unset, keys, cloneDeep, isEqual} from 'lodash';
import {ZitiDataService} from "../../../services/ziti-data.service";
import {GrowlerService} from "../../messaging/growler.service";
import {GrowlerModel} from "../../messaging/growler.model";
import {Identity} from "../../../models/identity";
import { IdentityFormService } from './identity-form.service';
import {MatDialogRef} from "@angular/material/dialog";
import {IdentitiesPageService} from "../../../pages/identities/identities-page.service";

@Component({
  selector: 'lib-identity-form',
  templateUrl: './identity-form.component.html',
  styleUrls: ['./identity-form.component.scss'],
  providers: [
    {
      provide: MatDialogRef,
      useValue: {}
    }
  ]
})
export class IdentityFormComponent extends ProjectableForm implements OnInit, OnChanges, AfterViewInit {
  @Input() formData: any = {};
  @Input() identityRoleAttributes: any[] = [];
  @Output() close: EventEmitter<any> = new EventEmitter<any>();
  @Output() dataChange: EventEmitter<any> = new EventEmitter<any>();

  initData: any = {};
  isEditing = false;
  enrollmentExpiration: any;
  jwt: any;
  isLoading = false;
  associatedServicePolicies: any = [];
  associatedServicePolicyNames: any = [];
  associatedServices: any = [];
  associatedServiceNames: any = [];
  servicesLoading = false;
  servicePoliciesLoading = false;
  authPolicies: any = [
    {id: 'default', name: 'Default'}
  ];

  showMore = false;
  errors: { name: string; msg: string }[] = [];
  formView = 'simple';
  enrollmentType = 'ott';
  enrollmentCA;
  enrollmentUPDB = '';
  settings: any = {};

  @ViewChild('nameFieldInput') nameFieldInput: ElementRef;
  constructor(
      public settingsService: SettingsService,
      public svc: IdentityFormService,
      public identitiesService: IdentitiesPageService,
      private zitiService: ZitiDataService,
      private growlerService: GrowlerService
  ) {
    super();
    this.identityRoleAttributes = ['test'];
  }

  ngOnInit(): void {
    this.settingsService.settingsChange.subscribe((results:any) => {
      this.settings = results;
    });
    this.jwt = this.identitiesService.getJWT(this.formData);
    this.enrollmentExpiration = this.identitiesService.getEnrollmentExpiration(this.formData);
    this.getAssociatedServices();
    this.getAssociatedServicePolicies();
    this.initData = cloneDeep(this.formData);
    this.watchData();
  }

  override ngAfterViewInit() {
    super.ngAfterViewInit();
    this.nameFieldInput.nativeElement.focus();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.isEditing = !isEmpty(this.formData.id);
  }

  getAssociatedServices() {
    this.zitiService.getSubdata('identities', this.formData.id, 'services').then((result: any) => {
      console.log(result);
      this.associatedServices = result.data;
      this.associatedServiceNames = this.associatedServices.map((svc) => {
        return svc.name;
      });
    });
  }

  getAssociatedServicePolicies() {
    this.zitiService.getSubdata('identities', this.formData.id, 'service-policies').then((result: any) => {
      console.log(result);
      this.associatedServicePolicies = result.data;
      this.associatedServicePolicyNames = this.associatedServicePolicies.map((policy) => {
        return policy.name;
      });
    });
  }

  get hasEnrolmentToken() {
    return this.identitiesService.hasEnrolmentToken(this.formData);
  }

  get jwtExpired() {
    return false;
  }

  headerActionRequested(action) {
    switch(action.name) {
      case 'save':
        this.save();
        break;
      case 'close':
        this.closeModal();
        break;
      case 'toggle-view':
        this.formView = action.data;
        break;
    }
  }

  updateEnrollment() {
    switch (this.enrollmentType) {
      case 'ott':
        this.formData.enrollment = {ott: true}
        break;
      case 'CA':
        this.formData.enrollment = {ottca: this.enrollmentCA};
        break;
      case 'updb':
        this.formData.enrollment = {updb: this.enrollmentUPDB};
        break;
      default:
        this.formData.enrollment = {ott: true}
        break;
    }
  }

  save() {
    if(!this.validate()) {
      return;
    }
    this.isLoading = true;
    this.svc.save(this.formData).then((result) => {
      this.closeModal(true, true);
    }).finally(() => {
      this.isLoading = false;
    });
  }

  validate() {
    this.errors = [];
    if (isEmpty(this.formData.name)) {
      this.errors['name'] = true;
    }
    return isEmpty(this.errors);
  }

  get apiCallURL() {
    return this.settings.selectedEdgeController + '/edge/management/v1/identities' + (this.formData.id ? `/${this.formData.id}` : '');
  }

  get apiData() {
    const data = {
          name: this.formData?.name || '',
          type: this.formData?.type?.name || '',
          appData: this.formData?.appData || '',
          isAdmin: this.formData?.isAdmin || '',
          roleAttributes: this.formData.roleAttributes || '',
          authPolicyId: this.formData.authPolicyId || '',
          externalId: this.formData.externalId || '',
          defaultHostingCost: this.formData.defaultHostingCost || '',
          defaultHostingPrecedence: this.formData.defaultHostingPrecedence || '',
          enrollment: this.formData.enrollment || {ott: true},
          tags: this.formData.tags || ''
    }
    return data;
  }

  _apiData = {};
  set apiData(data) {
    this._apiData = data;
  }

  serviceSelected(event) {

  }

  copyToClipboard(val) {
    navigator.clipboard.writeText(val);
    const growlerData = new GrowlerModel(
        'success',
        'Success',
        `Text Copied`,
        `API call URL copied to clipboard`,
    );
    this.growlerService.show(growlerData);
  }

  closeModal(refresh = false, ignoreChanges = false): void {
    if (!ignoreChanges && this._dataChange && !confirm('You have unsaved changes. Do you want to leave this page and discard your changes or stay on this page?')) {
      return;
    }
    this.close.emit({refresh: refresh});
  }

  clear(): void {
  }

  _dataChange = false;
  watchData() {
    delay(() => {
      const dataChange = !isEqual(this.initData, this.formData);
      if (dataChange !== this._dataChange) {
        this.dataChange.emit(dataChange);
      }
      this._dataChange = dataChange;
      this.watchData();
    }, 100);
  }
}
