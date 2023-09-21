import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'lib-form-header',
  templateUrl: './form-header.component.html',
  styleUrls: ['./form-header.component.scss']
})
export class FormHeaderComponent {
  @Input() title = '';
  @Input() moreActions: any = [];

  @Output() actionRequested: EventEmitter<any> = new EventEmitter<any>();

  formView = 'simple';
  showActionsDropDown = false;

  constructor() {}

  requestAction(action, data?: any) {
    if (action === 'toggle-view') {
      if (this.formView === 'simple') {
        this.formView = 'raw';
      } else {
        this.formView = 'simple';
      }
      data = this.formView;
    }
    this.actionRequested.emit({name: action, data: data})
    this.showActionsDropDown = false;
  }

  showMoreActions() {
    this.showActionsDropDown = true;
  }

  closeActionsMoreActions() {
    this.showActionsDropDown = false;
  }
}
