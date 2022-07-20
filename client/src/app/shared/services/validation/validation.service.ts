import { FormControl } from '@angular/forms';

export type AssociativeArray<T = unknown> = {[key: string]: T } | T[];

export class ValidationService {

  static getValidatorErrorMessage(validatorName: string, validatorValue?: any) {
      const config: AssociativeArray = {
          'required': 'Required',
          'invalidEmailAddress': 'Invalid email address',
          'invalidFullName': 'Invalid Full Name',
          'currentPassword': 'Invalid current password',
          'addEmail': 'This email already exists',
          'invalidConfirmPassword': 'Passwords do not match, please retype',
          'invalidPassword': 'Invalid password. Password must be at least 8 characters long, and contain a number and symbol',
          'minlength': `Minimum length ${validatorValue ? validatorValue.requiredLength : 0}`,
          'maxlength': `Maximum length ${validatorValue ? validatorValue.requiredLength : 0}`,
          'invalidCreditCardNumber': 'Not a valid credit card number',
          'invalidCardCvv': 'Invalid CVV number',
          'invalidCardDate': 'Invalid card expire date'
      };

    return config[validatorName];
  }

  static emailValidator(c: FormControl) {
      if (c.value &&
         c.value.match(/[a-zA-Z\d!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z\d!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z\d](?:[a-zA-Z\d-]*[a-z\d])?\.)+[a-z\d](?:[a-z\d-]*[a-z\d])?/)) {
          return null;
      } else {
          return {'invalidEmailAddress': true};
      }
  }

  // Visa, MasterCard, American Express, Diners Club, Discover, and JCB cards:
  static cardNumber(c: FormControl) {
    if (c.value && (
      c.value.match(/^(?:4[0-9]{12}(?:[0-9]{3})?)$/) ||
      c.value.match(/^(?:5[1-5][0-9]{14})$/) ||
      c.value.match(/^(?:3[47][0-9]{13})$/))) {
      return null;
    } else {
      return {'invalidCreditCardNumber': true};
    }
  }

  static cardCvv(c: FormControl) {
    if (c.value && c.value.match(/^[0-9]{3}$/)) {
      return null;
    } else {
      return {'invalidCardCvv': true};
    }
  }

  static cardExpireDate(c: FormControl) {
    if (c.value && c.value.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      return null;
    } else {
      return {'invalidCardDate': true};
    }
  }

  static passwordValidator(c: FormControl) {
      if (c.value &&
        c.value.match(/^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[`~!@#$%^&*_\-+=|\/?<>])([a-zA-Z\d`~!@#$%^&*_\-+=|/?<>]{8,16})$/)) {
          return null;
      } else {
          return {'invalidPassword': true};
      }
  }

  static fullNameValidator(c: FormControl)  {
    if (c.value && c.value.match(/^(\w{3,})+\s+([\w\s]{3,})+$/i)) {
      return null;
    } else {
      return {'invalidFullName': true};
    }
  }

  static passwordsEqualValidator(c: FormControl) {
    if (c.value.newPassword.length > 0 &&
      (c.value.confirmPassword.length > 0 &&
        c.value.newPassword !== c.value.confirmPassword)) {
      return {'invalidConfirmPassword': true};
    } else {
      return null;
    }
  }

  static maxLength(): string {
    return "javascript: if (this.value.length > this.maxLength) this.value = this.value.slice(0, this.maxLength);";
  }
}
