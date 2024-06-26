import { IErrorMessages } from '../interfaces/error-messages.interface';

export const ErrorMessages: Readonly<IErrorMessages> = {
  slotNotFound: 'Slot Not found',
  sharableLinkNotFound: 'Sharable link not found',
  phoneNumberNotSpecified: 'Phone number not specified',
  addressNumberNotSpecified: 'Address not specified',
  slotIsBusy: 'Slot(s) is/are busy',
  provideCustomDate: 'Please provide custom date',
  calendarNotFound: 'Calendar Not Found',
  userExist: 'This email already registered',
  resetPassword: 'If your account exists you will receive an email',
  userNotFound: 'Invalid credentials',
  incorrectPassword: 'Current password is not correct',
  passwordDoesNotMatch: 'Password does not match',
  confirmError: 'Account confirmation error',
  socialAccountExistError: 'Account with this email registered as social',
  socialAccountExist: 'User already exists, but Social account was not connected to user\'s account',
  availabilityExists: 'Availability data already exists!'
};
