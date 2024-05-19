import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs';
import { CalendarAccess } from 'src/app/core/interfaces/calendar/calendar-access.interface';
import { CalendarAccessService } from 'src/app/core/services/calendar/access.service';
import { SubscriptionPlanItemComponent } from '../../subscription-plan-item/subscription-plan-item.component';

@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.scss']
})
export class ContactsComponent implements OnInit {

  error: any|null;
  data: CalendarAccess[] = [];
  filteredData: CalendarAccess[] = [];
  searchQuery = '';

  get personalEmailDomains(): string[] {
    return ['gmail', 'outlook', 'homail', 'live', 'yahoo', 'msn'];
  }

  constructor(
    private readonly service: CalendarAccessService
  ) { }

  ngOnInit(): void {
    this.fetchContacts();
  }

  onSearchUpdate(event: Event) {
    this.searchQuery = (event.target as any).value;
    this.filterData()
  }

  filterData() {
    const query = this.searchQuery.toLocaleLowerCase().trim();
    if(query.length == 0) {
      this.filteredData = this.data;
      return
    }

    this.filteredData = this.data.filter((item) => {
      return item.owner.firstName.toLowerCase().includes(query) ||
        item.owner.lastName.toLowerCase().includes(query) ||
        item.owner.email.toLowerCase().includes(query) ||
        this.getContactCompany(item).toLowerCase().includes(query)
    });
  }

  fetchContacts() {
    this.service.fetchAccessibleContacts()
      .pipe(first())
      .subscribe({
        next: (data: CalendarAccess[] | null) => {
          this.data = data ?? [];
          this.filterData();
        },
        error: (error) => {
          this.error = error;
        }
      });
  }

  getContactName(item: CalendarAccess): string {
    return `${item.owner.firstName ?? ''} ${item.owner.lastName ?? ''}`.trim();
  }

  getContactCompany(item: CalendarAccess): string {
    const email = item.owner.email;
    const domain = email.substring(email.lastIndexOf("@") + 1, email.lastIndexOf("."));
    if(this.personalEmailDomains.includes(domain.toLocaleLowerCase())) {
      return 'Personal';
    }
    return domain;
  }

  revokeAccess(item: CalendarAccess) {
    console.log(`revoke access for ${item.id}`);
  }
}
