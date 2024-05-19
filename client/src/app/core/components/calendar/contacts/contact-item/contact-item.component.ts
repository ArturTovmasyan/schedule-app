import {Component, Input, OnInit} from '@angular/core';
import {CalendarAccess} from "../../../../interfaces/calendar/calendar-access.interface";
import {BroadcasterService} from "../../../../../shared/services";
import {first} from "rxjs/operators";
import {AvailabilityService} from "../../../../services/calendar/availability.service";

@Component({
  selector: 'app-contact-item',
  templateUrl: './contact-item.component.html',
  styleUrls: ['./contact-item.component.scss']
})
export class ContactItemComponent implements OnInit {

  @Input("contact")
  contact!: CalendarAccess;

  constructor(private broadcaster: BroadcasterService, private availabilityService: AvailabilityService) {
  }

  ngOnInit(): void {
  }

  get personalEmailDomains(): string[] {
    return ['gmail', 'outlook', 'homail', 'live', 'yahoo', 'msn'];
  }

  getContactName(item: CalendarAccess): string {
    return `${item.owner.firstName ?? ''} ${item.owner.lastName ?? ''}`.trim();
  }

  getContactCompany(item: CalendarAccess): string {
    const email = item.owner.email;
    const domain = email.substring(email.lastIndexOf("@") + 1, email.lastIndexOf("."));
    if (this.personalEmailDomains.includes(domain.toLocaleLowerCase())) {
      return 'Personal';
    }
    return domain;
  }

  revokeAccess(item: CalendarAccess) {
    console.log(`revoke access for ${item.id}`);
  }

  getContactAvailability() {
    const contactId = this.contact.owner.id;
    this.availabilityService.getByUserId(contactId)
      .pipe(first())
      .subscribe({
        next: (data: any | null) => {
          debugger;
          const availabilityData = data?.availabilityData;
          const contactData = {
            ...availabilityData,
            // contactId
          }
          this.broadcaster.broadcast('contact_calendar_data', contactData);
        },
        error: (error) => {
          console.error(error.message);
        }
      });
  }
}
