import {Component, Input, OnInit} from '@angular/core';
import {CalendarAccess} from "../../../../interfaces/calendar/calendar-access.interface";

@Component({
  selector: 'app-contact-item',
  templateUrl: './contact-item.component.html',
  styleUrls: ['./contact-item.component.scss']
})
export class ContactItemComponent implements OnInit {

  @Input("contact")
  contact!: CalendarAccess;

  constructor() { }

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
}
