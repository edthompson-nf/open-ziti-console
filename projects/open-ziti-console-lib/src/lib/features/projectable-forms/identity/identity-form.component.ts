import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ProjectableForm} from "../projectable-form.class";
import {SettingsService} from "../../../services/settings.service";

@Component({
  selector: 'lib-identity-form',
  templateUrl: './identity-form.component.html',
  styleUrls: ['./identity-form.component.scss']
})
export class IdentityFormComponent extends ProjectableForm implements OnInit {
  @Input() formData: any;
  @Output() close: EventEmitter<void> = new EventEmitter<void>();

  associatedServicePolicies: any = [];
  associatedServices: any = ['Testing 1', 'Testing 2', 'Testing 3', 'One Test', 'Two Test'];
  servicesLoading = false;
  servicePoliciesLoading = false;
  authPolicies: any = [];
  moreActions: any = [
    {name: 'open-metrics', label: 'Open Metrics'}
  ]

  showMore = false;
  errors: { name: string; msg: string }[];
  formView = 'simple';

  settings: any = {};

  constructor(public settingsService: SettingsService) {
    super();
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

  serviceSelected(event) {

  }

  closeModal(): void {
    this.close.emit()
  }

  save(): void {
    this.close.emit()
  }

  clear(): void {
  }

}
