import { IErrorMessages } from '../interfaces/error-messages.interface';

export const ErrorMessages: Readonly<IErrorMessages> = {
  userExist: 'User already exists',
  userNotFound: 'User not found',
  incorrectPassword: 'current password is not correct',
  passwordDoesNotMatch: 'Password does not match',
  confirmError: 'Account confirmation error',
  socialAccountExistError: 'Account with this email registered as social',
  socialAccountExist: 'User already exists, but Social account was not connected to user\'s account',
  availabilityExists: 'Availability data already exists!'
};
