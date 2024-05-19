import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-error-message',
  templateUrl: './error-message.component.html',
  styleUrls: ['./error-message.component.scss']
})
export class ErrorMessageComponent  {

  @Input() errors: any;
  @Input() fieldName!: string;

  get errorMessages() {
    if (this.errors && this.errors.length > 0) {
      for (let property in this.errors) {
        if (this.errors[property].target == this.fieldName) {
          return this.errors[property].message;
        }
      }
    }
    return null;
  }
}
