import { Pipe, PipeTransform } from '@angular/core';
import { CalendarAccess } from "../../../interfaces/calendar/calendar-access.interface";

@Pipe({
  name: 'getContactName'
})
export class GetContactNamePipe implements PipeTransform {

  transform(item: CalendarAccess): string {
    return `${item.owner.firstName ?? ''} ${item.owner.lastName ?? ''}`.trim();
  }

}
