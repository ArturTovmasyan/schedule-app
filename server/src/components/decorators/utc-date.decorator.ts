import { ValueTransformer } from 'typeorm';

export const UTCDateTransformer: ValueTransformer = {
  to(value: any): any {
    return (
      typeof value !== 'string' ? (<Date>value).toISOString() : value
    ).replace('Z', '');
  },
  from(value: any): any {
    const milSec = value.getTime();
    const offset = value.getTimezoneOffset();
    return new Date(milSec + -offset * 60 * 1000);
  },
};
