import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'lib-form-field-toggle',
  templateUrl: './form-field-toggle.component.html',
  styleUrls: ['./form-field-toggle.component.scss']
})
export class FormFieldToggleComponent {

  @Input() toggleOn = false;
  @Output() toggleOnChange = new EventEmitter<boolean>();

  toggleSwitch() {
    this.toggleOn = !this.toggleOn;
    this.toggleOnChange.emit(this.toggleOn);
  }

}
