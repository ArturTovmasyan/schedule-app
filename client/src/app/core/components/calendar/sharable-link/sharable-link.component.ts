import { Component, OnDestroy, OnInit } from '@angular/core';
import * as moment from 'moment';
import { BehaviorSubject, debounceTime, first, Observable, of, shareReplay, Subject, switchMap } from 'rxjs';
import { CalendarAccess } from 'src/app/core/interfaces/calendar/calendar-access.interface';
import { CalendarAccessService } from 'src/app/core/services/calendar/access.service';
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

  subscription: BehaviorSubject<boolean>;
  selectedDates$: BehaviorSubject<any> = new BehaviorSubject([]);
  selectedDates:any = []
  showLocation = false;
  choosedLocation = 'Choose...';
  choosedLocationObj: Location | null = null;
  connectMessage = '';
  // for location: incoming call and address
  phoneNumber = null;
  address = null;

  errorMessage = '';
  // for contacts
  contacts: Observable<CalendarAccess[]>;
  private term: Subject<string> = new Subject<string>();
  filteredContacts: CalendarAccess[] = [];

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
    private readonly calendarAccessService: CalendarAccessService
  ) {
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
          return moment(a, "MMM-YY").diff(moment(b, "MMM-YY"));
        })
      )
      this.selectedDates$.next(sortedObject);
    });

    this.contacts = this.term.pipe(
      debounceTime(250),
      switchMap((term: string) => {
        const query = term.toLocaleLowerCase().trim();

        const filteredData = this.filteredContacts.filter((item) => {

          if (!query) {
            return true;
          }

          return item.owner.firstName.toLowerCase().startsWith(query) ||
            item.owner.lastName.toLowerCase().startsWith(query) ||
            item.owner.email.toLowerCase().startsWith(query);
        });
        return of(filteredData);
      }),
      shareReplay(1)
    )
  }


  ngOnInit(): void {
    // this.broadcaster.broadcast('contact_calendar_data', []);
    this.broadcaster.broadcast('multiselect_calendar', true);
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

    this.choosedLocation = loc.title;
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
    console.log(requestParams);
    // TODO: send API Request with request Parameters
  }

  loadContacts() {
    this.calendarAccessService.fetchAccessibleContacts()
      .pipe(first())
      .subscribe({
        next: (data: CalendarAccess[] | null) => {
          this.contacts = of(data ?? []);
        },
        error: (error) => {
          console.log(error);
        }
      });
  }

  filterContacts(query: string) {
    return this.term.next(query);
  }



  ngOnDestroy(): void {
    this.broadcaster.broadcast('reset_event');
    this.selectedDates$.unsubscribe();
    this.subscription.unsubscribe();
  }

}
