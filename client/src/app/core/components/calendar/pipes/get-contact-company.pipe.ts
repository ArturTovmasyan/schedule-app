import { Pipe, PipeTransform } from '@angular/core';
import { CalendarAccess } from "../../../interfaces/calendar/calendar-access.interface";
import { Calendar } from '@fullcalendar/core';

@Pipe({
  name: 'getContactCompany'
})
export class GetContactCompanyPipe implements PipeTransform {

  transform(item: CalendarAccess | string): string  {
    const email = typeof(item) == 'string' ? item : item.owner.email;
    const personalEmailDomains = ['gmail', 'outlook', 'homail', 'live', 'yahoo', 'msn'];
    const domain = email.substring(email.lastIndexOf("@") + 1, email.lastIndexOf("."));
    if (personalEmailDomains.includes(domain.toLocaleLowerCase())) {
      return 'Personal';
    }
    return domain;

  }

}
