import {Component, OnInit} from '@angular/core';
import {first} from 'rxjs';
import {CalendarAccess} from 'src/app/core/interfaces/calendar/calendar-access.interface';
import {CalendarAccessService} from 'src/app/core/services/calendar/access.service';

@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.scss']
})
export class ContactsComponent implements OnInit {

  error: any | null;
  data: CalendarAccess[] = [];
  filteredData: CalendarAccess[] = [];
  searchQuery = '';
  lastOwnerId = '';

  constructor(
    private readonly service: CalendarAccessService
  ) {
  }

  ngOnInit(): void {
    this.fetchContacts();
  }

  onSearchUpdate(event: Event) {
    this.searchQuery = (event.target as any).value;
    this.filterData()
  }

  filterData() {
    const query = this.searchQuery.toLocaleLowerCase().trim();

    this.filteredData = this.data.filter((item) => {

      if (!query) {
        this.lastOwnerId = '';
        return true;
      }

      //ignore duplicates
      // if (this.lastOwnerId && this.lastOwnerId == item.owner.id) {
      //   return false;
      // }
      // this.lastOwnerId = item.owner.id;

      return item.owner.firstName.toLowerCase().startsWith(query) ||
        item.owner.lastName.toLowerCase().startsWith(query) ||
        item.owner.email.toLowerCase().startsWith(query);
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
}
