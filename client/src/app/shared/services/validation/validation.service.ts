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
          'invalidPassword': 'Invalid password. Password must be at least 8 characters long, and contain a number and symbol.',
          'minlength': `Minimum length ${validatorValue ? validatorValue.requiredLength : 0}`,
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

  //@example Test1324>
  static passwordValidator(c: FormControl) {
      if (c.value &&
        c.value.match(/^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[`~!@#$%^&*_\-+=|\/?<>])([a-zA-Z\d`~!@#$%^&*_\-+=|\/?<>]{8,16})$/)) {
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
}
