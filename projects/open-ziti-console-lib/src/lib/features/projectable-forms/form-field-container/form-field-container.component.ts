import {Component, Input} from '@angular/core';

@Component({
  selector: 'lib-form-field-container',
  templateUrl: './form-field-container.component.html',
  styleUrls: ['./form-field-container.component.scss']
})
export class FormFieldContainerComponent {

  @Input() title = '';
  @Input() helpText: any = undefined;
  @Input() label: any = undefined;
  @Input() count: any = undefined;
  constructor() {}
}
