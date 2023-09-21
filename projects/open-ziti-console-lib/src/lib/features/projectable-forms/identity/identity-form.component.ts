import {Component, EventEmitter, Input, Output} from '@angular/core';
import {ProjectableForm} from "../projectable-form.class";

@Component({
  selector: 'lib-identity-form',
  templateUrl: './identity-form.component.html',
  styleUrls: ['./identity-form.component.scss']
})
export class IdentityFormComponent extends ProjectableForm {
  @Input() formData: any;
  @Output() close: EventEmitter<void> = new EventEmitter<void>();

  moreActions: any = [
    {name: 'open-metrics', label: 'Open Metrics'}
  ]

  errors: { name: string; msg: string }[];
  formView = 'simple';

  constructor() {
    super();
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

  closeModal(): void {
    this.close.emit()
  }

  save(): void {
    this.close.emit()
  }

  clear(): void {
  }

}
