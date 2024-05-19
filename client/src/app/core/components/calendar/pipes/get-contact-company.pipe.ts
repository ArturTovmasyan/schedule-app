import { Pipe, PipeTransform } from '@angular/core';
import { CalendarAccess } from "../../../interfaces/calendar/calendar-access.interface";

@Pipe({
  name: 'getContactCompany'
})
export class GetContactCompanyPipe implements PipeTransform {

  transform(item: CalendarAccess): string  {
    const email = item.owner.email;
    const personalEmailDomains = ['gmail', 'outlook', 'homail', 'live', 'yahoo', 'msn'];
    const domain = email.substring(email.lastIndexOf("@") + 1, email.lastIndexOf("."));
    if (personalEmailDomains.includes(domain.toLocaleLowerCase())) {
      return 'Personal';
    }
    return domain;

  }

}
