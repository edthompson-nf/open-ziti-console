import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ProjectableForm} from "../projectable-form.class";
import {SettingsService} from "../../../services/settings.service";

import {isEmpty, unset, keys} from 'lodash';
import {ZitiDataService} from "../../../services/ziti-data.service";
import {GrowlerService} from "../../messaging/growler.service";
import {GrowlerModel} from "../../messaging/growler.model";
import {Identity} from "../../../models/identity";

@Component({
  selector: 'lib-identity-form',
  templateUrl: './identity-form.component.html',
  styleUrls: ['./identity-form.component.scss']
})
export class IdentityFormComponent extends ProjectableForm implements OnInit {
  @Input() formData: any = {};
  @Input() identityRoleAttributes: any[] = [];
  @Output() close: EventEmitter<any> = new EventEmitter<any>();

  isLoading = false;
  associatedServicePolicies: any = [];
  associatedServices: any = [];
  servicesLoading = false;
  servicePoliciesLoading = false;
  authPolicies: any = [
    {id: 'default', name: 'Default'}
  ];

  showMore = false;
  errors: { name: string; msg: string }[];
  formView = 'simple';

  settings: any = {};

  constructor(
      public settingsService: SettingsService,
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

  closeModal(refresh = false): void {
    this.close.emit({refresh: refresh});
  }

  save(): void {
    const isUpdate = !isEmpty(this.formData.id);
    const data: any = this.getIdentityDataModel(isUpdate);
    const svc = isUpdate ? this.zitiService.patch.bind(this.zitiService) : this.zitiService.post.bind(this.zitiService);
    this.isLoading = true;
    svc('identities', data, this.formData.id).then((result) => {
      const growlerData = new GrowlerModel(
          'success',
          'Success',
          `Identity ${isUpdate ? 'Updated' : 'Created'}`,
          `Successfully ${isUpdate ? 'updated' : 'created'} Identity: ${this.formData.name}`,
      );
      this.growlerService.show(growlerData);
      this.closeModal(true);
    }).catch((error) => {
      let errorMessage;
      if (error?.error?.error?.cause?.reason) {
        errorMessage = error?.error?.error?.cause?.reason;
      } else if (error?.error?.error?.message) {
        errorMessage = error?.error?.error?.message;
      } else {
        errorMessage = 'An unknown error occurred';
      }
      const growlerData = new GrowlerModel(
          'error',
          'Error',
          `Error Creating Identity`,
          errorMessage,
      );
      this.growlerService.show(growlerData);
    }).finally(() => {
      this.isLoading = false;
    });
  }

  getIdentityDataModel(isUpdate) {
    const saveModel: any = new Identity();
    const modelProperties = keys(saveModel);
    modelProperties.forEach((prop) => {
      switch(prop) {
        case 'type':
          if(isUpdate) {
            saveModel[prop] = this.formData[prop].id;
          } else {
            saveModel[prop] = this.formData[prop];
          }
          break;
        case 'enrollment':
          if(isUpdate) {
            saveModel[prop] = this.formData[prop];
          } else {
            unset(saveModel, 'enrollment');
          }
          break;
        default:
          saveModel[prop] = this.formData[prop];
      }
    });
    if (this.settingsService.settings.useNodeServer && isUpdate) {
      saveModel.id = this.formData.id;
    }
    return saveModel;
  }

  clear(): void {
  }

}
