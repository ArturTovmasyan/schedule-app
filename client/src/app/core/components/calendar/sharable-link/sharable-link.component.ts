import { Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import * as moment from 'moment';
import { DOCUMENT } from '@angular/common';
import { BehaviorSubject, debounceTime, distinctUntilChanged, filter, first, fromEvent, map, Observable, of, shareReplay, Subject, switchMap, tap } from 'rxjs';
import { CalendarAccess } from 'src/app/core/interfaces/calendar/calendar-access.interface';
import { CalendarAccessService } from 'src/app/core/services/calendar/access.service';
import { AvailabilityService } from 'src/app/core/services/calendar/availability.service';
import { CommonService } from 'src/app/core/services/common.service';
import { BroadcasterService } from "../../../../shared/services";

export interface Location {
  id?: string;
  title: string;
  subTitle?: string;
  image: string;
  active: boolean;
  value: string;
}


@Component({
  selector: 'app-sharable-link',
  templateUrl: './sharable-link.component.html',
  styleUrls: ['./sharable-link.component.scss']
})
export class SharableLinkComponent implements OnInit, OnDestroy {

  @ViewChild('contactInput') input!: ElementRef;
  subscription: BehaviorSubject<boolean>;
  selectedDates$: BehaviorSubject<any> = new BehaviorSubject([]);
  selectedDates:any = []
  showLocation = false;
  choosedLocationObj: Location | null = null;
  connectMessage = '';
  // for location: incoming call and address
  phoneNumber = null;
  address = null;

  errorMessage = '';
  // for contacts
  contacts: CalendarAccess[] = [];
  private term: Subject<string> = new Subject<string>();
  filteredContacts$ = new BehaviorSubject<CalendarAccess[]>([]);
  selectedContacts$ = new BehaviorSubject<CalendarAccess[]>([]);
  selectedContacts: CalendarAccess[] = [];
  // used only to show on UI in joint Availibility
  selectedEmails: string[] = [];
  // MAP<email, availability_data>
  emailsWithAvailabilityMap = new Map();

  sharableLink = '';
  showCopiedText = false;
  private readonly _document: Document;

  locations: Location[] = [
    { title: 'ZOOM', subTitle: 'Web conference', image:'assets/zoom.png', active: false, value: 'zoom'},
    { title: 'Microsoft Teams', subTitle: 'Web conference', image: 'assets/microsoft-teams.png', active: false, value: 'teams' },
    { title: 'Google Meet', subTitle: 'Web conference', image: 'assets/google-meet.png', active: false, value: 'meet' },
    { title: 'Inbound phone call', subTitle: 'You will receive a phone call', image: 'assets/incoming-call.png', active: false, value: 'incoming-call' },
    { title: 'Outbound phone call', subTitle: 'You will be making a phone calling', image: 'assets/outgoing-call.png', active: false, value: 'outgoing-call' },
    { title: 'Physical address', subTitle: 'You will meet face to face', image: 'assets/location.png', active: false, value: 'address' }
  ]

  get timezone(): string {
    return this.commonService.localTimezone;
  }

  constructor(
    private readonly broadcaster: BroadcasterService,
    private readonly commonService: CommonService,
    private readonly calendarAccessService: CalendarAccessService,
    private availabilityService: AvailabilityService,
    @Inject(DOCUMENT) document: any

  ) {
    this._document = document;
    this.subscription = this.broadcaster.on('selectSharableLinkDates').subscribe((dates: any) => {
      const startdate = moment.utc(dates.start).local().format('ddd, MMM Do');
      if (this.selectedDates[startdate]) {
        this.selectedDates[startdate].push(dates);
      } else {
        this.selectedDates[startdate] = [dates];
      }
      this.selectedDates[startdate].sort(function (left:any, right:any) {
        return moment.utc(left.start).diff(moment.utc(right.start))
      });
      const sortedObject = Object.fromEntries(
        Object.entries(this.selectedDates).sort(([a,], [b,]) => {
          return moment(a, "dd-MMM-YY").diff(moment(b, "dd-MMM-YY"));
        })
      )
      this.selectedDates$.next(sortedObject);
    });
  }


  ngOnInit(): void {
    this.broadcaster.broadcast('multiselect_calendar', true);

  }

  ngAfterViewInit() {
    this.initFilterContact();
  }

  removeTime(date: any, i: any) {
    const selectedDate = this.selectedDates[date].splice(i, 1);
    if (this.selectedDates[date].length == 0) {
      delete this.selectedDates[date];
    }
    this.selectedDates$.next(this.selectedDates);
    this.broadcaster.broadcast('removeSharableLinkTimeSlot', selectedDate);
  }

  chooseLocation(loc: Location) {

    this.choosedLocationObj = loc;
    this.showLocation = false;
    this.connectMessage = '';
    if (!['zoom', 'meet', 'teams'].includes(loc.value)) {
      // if incoming and outgoing and address is choosed from location option
      // no need to check for connecttion of location choosed
      return;
    }

    // TODO: fetch if location is connected here
    setTimeout(() => {
        // connected var value got from server
        const connected = false;
        this.connectMessage = '';
        if (!connected) {
          this.connectMessage = `Please <a href="javascript:void(0)">connect </a><span class="">${loc.title}</span>
        to your account`;
        }
    }, 1000);
    // end

  }

  createSharableLink() {
    const selectedDates = this.selectedDates$.value;
    if (selectedDates.length == 0) {
      this.errorMessage = 'Please select at least one available time slot';
    }else if (!this.choosedLocationObj) {
      this.errorMessage = 'Please select the Location';
    }else if (this.choosedLocationObj?.value == 'incoming-call' && !this.phoneNumber) {
      this.errorMessage = 'Please enter Phone Number';
    }else if (this.choosedLocationObj?.value == 'address' && !this.phoneNumber) {
      this.errorMessage = 'Please enter Address';
    }

    if (this.errorMessage) {
      setTimeout(() => {
        this.errorMessage = '';
      }, 3000);
      return;
    }

    const requestParams = new Map()
      .set("selectedDates", selectedDates)
      .set("location", this.choosedLocationObj?.value);

    if (this.choosedLocationObj?.value == 'incoming-call') {
      requestParams.set('phone_number', this.phoneNumber);
    }
    if (this.choosedLocationObj?.value == 'address') {
      requestParams.set('address', this.address);
    }
    // TODO: send API Request with request Parameters
    this.sharableLink = `https://entangles.io/share/abc-def-xyz`;
  }

  // load contacts when clicked on Joint availability "plus" sign
  loadContacts() {
    if (this.contacts.length > 0){
      return;
    }
    this.calendarAccessService.fetchAccessibleContacts()
      .pipe(first())
      .subscribe({
        next: (data: CalendarAccess[] | null) => {
          this.contacts = data ?? [];
        },
        error: (error) => {
          console.log(error);
        }
      });
  }

  initFilterContact() {
      // initializze keyup event to get filtered contacts
      fromEvent(this.input.nativeElement, 'keyup')
        .pipe(
          map((event: any) => {
            return event.target.value;
          }),
          filter(res => res.length >= 1),
          debounceTime(500),
          distinctUntilChanged(),
          tap((searchedString) => {
            const filteredContact = this.contacts.filter(contact => this.filterContact(contact, searchedString));
            this.filteredContacts$.next(filteredContact);
          })
        )
        .subscribe();
  }

  filterContact(item: any, query: any) {
    return (item.owner.firstName.toLowerCase().startsWith(query) ||
          item.owner.lastName.toLowerCase().startsWith(query) ||
      item.owner.email.toLowerCase().startsWith(query));
  }

  // select contact after search in joint availability
  selectContact(contact: CalendarAccess) {
    this.selectedContacts.push(contact);
    this.selectedEmails.push(contact.owner.email);
    this.selectedContacts$.next(this.selectedContacts);
    this.input.nativeElement.value = '';
    this.filteredContacts$.next([]);
    this.getContactAvailability(contact);
  }

  // add availability to the calendar
  getContactAvailability(contact: CalendarAccess) {
    const contactId = contact.owner.id;
    const contactEmail = contact.owner.email;

    this.availabilityService.getByUserId([contactId])
      .pipe(first())
      .subscribe({
        next: (data: any | null) => {
          const availabilityData = data?.availabilityData;
          this.emailsWithAvailabilityMap.set(contactEmail, availabilityData);
          this.broadcastContactData();

        },
        error: (error) => {
          console.error(error.message);
        }
      });
  }

  broadcastContactData() {
    let contacts = [...this.emailsWithAvailabilityMap.values()].flat();
    console.log([...new Set(contacts)]);
    contacts = {...contacts};
    this.broadcaster.broadcast('contact_calendar_data', contacts);
  }

  removeSingleContact(contact: CalendarAccess ) {
    this.selectedContacts = this.selectedContacts.filter((res: CalendarAccess) => {
      return res.owner.email != contact.owner.email
    });
    this.selectedEmails = this.selectedEmails.filter((res) => {
      return res != contact.owner.email
    });
    this.selectedContacts$.next(this.selectedContacts);
    this.emailsWithAvailabilityMap.delete(contact.owner.email);
    this.broadcastContactData();
  }

  copyLink(text: any) {
    // after link copied show copied
    const textarea = this._document.createElement('textarea');
    const styles = textarea.style;
    styles.position = 'fixed';
    styles.top = styles.opacity = '0';
    styles.left = '-999em';
    textarea.setAttribute('aria-hidden', 'true');
    textarea.value = text;
    // Making the textarea `readonly` prevents the screen from jumping on iOS Safari.
    textarea.readOnly = true;
    this._document.body.appendChild(textarea);

    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);
    this._document.execCommand('copy');
    textarea.remove();
    this.showCopiedText = true;
    setTimeout(() => {
      this.showCopiedText = false;
    }, 2000);
  }

  ngOnDestroy(): void {
    this.broadcaster.broadcast('reset_event');
    this.selectedDates$.unsubscribe();
    this.subscription.unsubscribe();
  }

}
