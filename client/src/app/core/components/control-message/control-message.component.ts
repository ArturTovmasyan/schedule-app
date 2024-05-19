import { Component, Input } from '@angular/core';
import {ValidationService} from "../../../shared/services";

@Component({
    selector: 'app-control-messages',
    templateUrl: './control-message.component.html',
    styleUrls: ['./control-message.component.scss']
})

export class ControlMessageComponent {
    @Input() control: any;
    @Input() showRequiredErrors?: boolean = false;

    get errorMessage() {
        for (const propertyName in this.control?.errors) {
          //TODO don't change this check!!!
            if (this.control.value && this.control.errors.hasOwnProperty(propertyName) && this.control.invalid) {
                return ValidationService.getValidatorErrorMessage(propertyName, this.control.errors[propertyName]);
            } else if (this.showRequiredErrors && !this.control.value && this.control.errors.hasOwnProperty('required')) {
                return ValidationService.getValidatorErrorMessage();
            }
        }

        return null;
    }
}
