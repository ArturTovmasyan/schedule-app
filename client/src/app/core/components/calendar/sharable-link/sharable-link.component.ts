import { Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import * as moment from 'moment';
import { DOCUMENT } from '@angular/common';
import { BehaviorSubject, debounceTime, distinctUntilChanged, filter, first, fromEvent, map, tap } from 'rxjs';
import { CalendarAccess } from 'src/app/core/interfaces/calendar/calendar-access.interface';
import { CalendarAccessService } from 'src/app/core/services/calendar/access.service';
import { AvailabilityService } from 'src/app/core/services/calendar/availability.service';
import { CommonService } from 'src/app/core/services/common.service';
import { BroadcasterService } from "../../../../shared/services";
import { SharableLinkService } from 'src/app/core/services/calendar/sharable-link.service';
import { MeetViaEnum } from '../enums/sharable-links.enum';
import { ActivatedRoute, Router } from '@angular/router';
import { CalendarPermissionService } from 'src/app/core/services/calendar/permission.service';
import { Location } from 'src/app/core/interfaces/calendar/location.interface';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-sharable-link',
  templateUrl: './sharable-link.component.html',
  styleUrls: ['./sharable-link.component.scss']
})
export class SharableLinkComponent implements OnInit, OnDestroy {

  linkId = '';
  readonly MeetViaEnum = MeetViaEnum;
  @ViewChild('contactInput') input!: ElementRef;
  subscription$: BehaviorSubject<boolean>;
  selectedDates$: BehaviorSubject<any> = new BehaviorSubject([]);
  selectedDates:any = []

  // both varible are used for update of sharable links only
  deletedTimeSlots: any = [];
  addedTimeSlots: any = [];

  showLocation = false;
  choosedLocationObj: Location | null = null;
  connectMessage = { 'title': '', 'type': '' };
  // for location: incoming call and address
  phoneNumber = null;
  address = null;

  errorMessage = '';
  // for contacts or attendees
  contacts: CalendarAccess[] = [];
  filteredContacts$ = new BehaviorSubject<CalendarAccess[]>([]);
  selectedContacts$ = new BehaviorSubject<CalendarAccess[]>([]);
  selectedContacts: CalendarAccess[] = [];
  // used only to show on UI in joint Availibility
  selectedEmails: string[] = [];
  // MAP<email, availability_data>
  emailsWithAvailabilityMap = new Map();
  sharableLink = '';
  showCopiedText = false;
  showJointAvailibility = false;
  updateView = true;
  private readonly _document: Document;

  locations: Location[] = [];

  get timezone(): string {
    return this.commonService.localTimezone;
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private readonly broadcaster: BroadcasterService,
    private readonly commonService: CommonService,
    private readonly calendarAccessService: CalendarAccessService,
    private readonly availabilityService: AvailabilityService,
    private readonly sharableLinkService: SharableLinkService,
    private readonly calendarPermissionService: CalendarPermissionService,
    @Inject(DOCUMENT) document: any
  ) {
    this.broadcaster.broadcast('reset_event');
    this.linkId = this.route.snapshot.params['id'];
    // get location list and get sharable link details
    this.sharableLinkService.getLocations()
      .subscribe({
        next: (res: any) => {
          this.locations = res;
          // load from api if link id is sent to parameters ie used for edit page
          if (this.linkId) {
            this.broadcaster.broadcast('multiselect_calendar', false);
              this.loadSharableLinkDetails(this.linkId);
          } else {
            this.broadcaster.broadcast('multiselect_calendar', true);
          }
        }
      });

    const linkId = this.route.snapshot.params['id'];
    // load from api if link id is sent to parameters ie used for edit page

    // load from saved Data of localstorage after connect redirection
    if (localStorage.getItem('savedDatas')) {
      this.runAfterRedirect();
    }

    this._document = document;
    this.subscription$ = this.broadcaster.on('selectSharableLinkDates').subscribe((dates: any) => {
      const startdate = moment.utc(dates.start).local().format('ddd, MMM Do');
      if (this.selectedDates[startdate]) {
        this.selectedDates[startdate].push(dates);
      } else {
        this.selectedDates[startdate] = [dates];
      }
      this.addedTimeSlots.push(dates);
      this.selectedDates[startdate].sort(function (left: any, right: any) {
        return moment.utc(left.start).diff(moment.utc(right.start))
      });
      const sortedObject = Object.fromEntries(
        Object.entries(this.selectedDates).sort(([a], [b]) => {
          return moment(a, "ddd, MMM Do").diff(moment(b, "ddd, MMM Do"));
        })
      )
      this.selectedDates = sortedObject;
      this.selectedDates$.next(sortedObject);
    });
  }

  // Order by descending date
  sortTimeslots = (a: any, b: any) => {
    return moment(a, "ddd, MMM Do").diff(moment(b, "ddd, MMM Do"));
  }

  ngOnInit(): void {
      // this.broadcaster.broadcast('multiselect_calendar', true);
  }

  ngAfterViewInit() {
    this.initFilterContact();
  }

  runAfterRedirect() {
    const savedData = localStorage.getItem('savedDatas') as string;
    if (savedData) {
      const savedDataArr = JSON.parse(savedData);
      this.choosedLocationObj = savedDataArr.choosedLocationObj;
      this.selectedDates = savedDataArr.selectedDates;
      this.selectedDates$.next(this.selectedDates);
      this.selectedContacts = savedDataArr.selectedContacts;
      this.selectedContacts$.next(this.selectedContacts);
      this.addedTimeSlots = savedDataArr.addedTimeSlots;
      this.deletedTimeSlots = savedDataArr.deletedTimeSlots;
      if (this.selectedContacts.length > 0) this.showJointAvailibility = true;
      const selectedDatesNew: any = [];
      for (const key in this.selectedDates) {
        const value = this.selectedDates[key];

        for (const val of value) {
          selectedDatesNew.push({
            'startDate': val['start'],
            'endDate': val['end']
          });
        }
      }
      setTimeout(() => {
        this.broadcaster.broadcast('addSharableLinkTimeSlot', selectedDatesNew);
      }, 2000);

      if (!this.choosedLocationObj?.available) {
        // if not connected show connect message
        this.connectMessage = {
          title: this.choosedLocationObj?.title as string,
          type: this.choosedLocationObj?.value as string
        };
      }
    }
  }

  loadSharableLinkDetails(linkId: string | null) {
    if (!linkId) {
      return;
    }

    this.updateView = false;

    this.sharableLinkService.getDetails(linkId)
      .subscribe({
        next: (res) => {
          this.choosedLocationObj = this.locations.find((loc) => loc.value == res.data.meetVia) as Location;
          this.sharableLink = `${environment.host}share/${res.data.id}`;
          for (const date of res.data.slots) {
            const startdate = moment.utc(date.startDate).local().format('ddd, MMM Do');
            if (this.selectedDates[startdate]) {
              this.selectedDates[startdate].push({ 'id': date.id, 'start': date.startDate, 'end': date.endDate });
            } else {
              this.selectedDates[startdate] = [{ 'id': date.id, 'start': date.startDate, 'end': date.endDate }];
            }
          }
          const sortedObject = Object.fromEntries(
            Object.entries(this.selectedDates).sort(([a], [b]) => {
              return moment(a, "dd-MMM-YY").diff(moment(b, "dd-MMM-YY"));
            })
          )
          this.selectedDates$.next(sortedObject);

          // for preselect events on calendar
          this.broadcaster.broadcast('addSharableLinkTimeSlot', res.data.slots);

          // for phone and address
          if (res.data.phoneNumber) {
            this.phoneNumber = res.data.phoneNumber;
          }
          if (res.data.address) {
            this.address = res.data.address;
          }

          // for attendees
          const attendees = res.data.attendees;
          if (attendees.length > 0) {
            this.showJointAvailibility = true;
            for (const attendee of attendees) {
              const cc: CalendarAccess = {
                id: '',
                comment: '',
                timeForAccess: null,
                owner: {
                  id: attendee.user.id,
                  email: attendee.user.email,
                  firstName: attendee.user.firstName,
                  lastName: attendee.user.lastName,
                  avatar: attendee.user.avatar
                }
              }
              // const cc = this.contacts.find((cont) => cont.owner.id == attendee.user.id) as CalendarAccess;
              this.selectedContacts.push(cc);
              this.selectedEmails.push(cc.owner.email);
              this.getContactAvailability(cc);
            }
            this.selectedContacts$.next(this.selectedContacts);
            this.filteredContacts$.next([]);
            this.broadcaster.broadcast('multiselect_calendar', false);

          }

        }
      });
  }

  getLocations() {
    this.sharableLinkService.getLocations()
      .subscribe({
        next: (res: any) => {
          this.locations = res;
        }
      })
  }

  // remove from selected timeslots
  removeTime(date: any, i: any) {
    const selectedDate = this.selectedDates[date].splice(i, 1);
    // run if in update page
    if (this.sharableLink && selectedDate?.[0]?.id) {
      this.deletedTimeSlots.push(selectedDate[0].id);
    } else {
      this.addedTimeSlots.filter((date: any) => {
        return date.start != selectedDate[0]['start'] &&
          date.end != selectedDate[0]['end']
      });
    }

    if (this.selectedDates[date].length == 0) {
      delete this.selectedDates[date];
    }
    this.selectedDates$.next(this.selectedDates);

    this.broadcaster.broadcast('removeSharableLinkTimeSlot', selectedDate);
  }

  chooseLocation(loc: Location) {
    this.choosedLocationObj = loc;
    this.showLocation = false;
    if (![MeetViaEnum.Zoom, MeetViaEnum.GMeet, MeetViaEnum.Teams].includes(loc.value)) {
      // if incoming and outgoing and address is choosed from location option
      // no need to check for connection of location choosed
      this.connectMessage = {
        title: '',
        type: ''
      }
      return;
    }

    if (!loc.available) {
      // if not connected show connect message
      this.connectMessage = {
        title: loc.title,
        type: loc.value
      };
    } else {
      this.connectMessage = {
        title: '',
        type: ''
      };
    }
  }

  // connect to zoom, meet or teams if not connected
  // type could be zoom, teams or gmeet used MeetViaEnum
  connect(type: string) {
    const savedData = {
      selectedContacts: this.selectedContacts,
      selectedDates: this.selectedDates$.value,
      choosedLocationObj: this.choosedLocationObj,
      addedTimeslots: this.addedTimeSlots,
      deletedTimeSlots: this.deletedTimeSlots
    }

    localStorage.setItem('savedDatas', JSON.stringify(savedData));
    localStorage.setItem('calendar-redirect', window.location.pathname);
    let connectApiReq = null;
    if (type == MeetViaEnum.Zoom) {
      this.calendarPermissionService.connectZoom()
        .subscribe({
          next: (url: string) => {
            window.location.href = url;
          }
        });
    }

    if (type == MeetViaEnum.GMeet) {
      connectApiReq = this.calendarPermissionService.connectGoogleCalendar();
    }

    if (type == MeetViaEnum.Teams) {
      connectApiReq = this.calendarPermissionService.connectOffice365Calendar()
    }

    if (connectApiReq) {
      connectApiReq.subscribe({
        next: (url: string) => {
          window.location.href = url;
        }
      });
    }
  }

  createSharableLink() {
    const selectedDates = this.selectedDates$.value;
    if (selectedDates.length == 0) {
      this.errorMessage = 'Please select at least one available time slot';
    } else if (!this.choosedLocationObj) {
      this.errorMessage = 'Please select the Location';
    } else if (this.choosedLocationObj?.value == MeetViaEnum.InboundCall && !this.phoneNumber) {
      this.errorMessage = 'Please enter Phone Number';
    } else if (this.choosedLocationObj?.value == MeetViaEnum.PhysicalAddress && !this.address) {
      this.errorMessage = 'Please enter Address';
    }

    if (this.errorMessage) {
      setTimeout(() => {
        this.errorMessage = '';
      }, 3000);
      return;
    }

    const selectedDatesNew = [];
    for (const key in selectedDates) {
      const value = selectedDates[key];
      for (const val of value) {
        selectedDatesNew.push({
          'startDate': val['start'],
          'endDate': val['end']
        });
      }
    }

    const requestParams = {
      'title': this.choosedLocationObj?.title,
      'slots': selectedDatesNew,
      'meetVia': this.choosedLocationObj?.value,
      'attendees': [] as any,
      'phoneNumber': null,
      'address': null
    }

    if (this.selectedContacts.length > 0) {
      requestParams['attendees'] = this.selectedContacts.map(x => x.owner.id);
    }

    if (this.choosedLocationObj?.value == MeetViaEnum.InboundCall) {
      requestParams['phoneNumber'] = this.phoneNumber;
    }
    if (this.choosedLocationObj?.value == MeetViaEnum.PhysicalAddress) {
      requestParams['address'] = this.address;
    }

    this.sharableLinkService.createLink(requestParams)
      .subscribe({
        next: (res: any) => {
          if (res.status) {
            if (localStorage.getItem('savedDatas')) localStorage.removeItem('savedDatas');
            // route to details page after link creationg for better update functionality
            // TODO: we can use same page. Will determine after update functionality is done in backend
            this.router.navigate(['/calendar/sharable-link', res.metadata.sharableLinkId]);
            // this.router.navigateByUrl(`/calendar/sharable-link/${res.metadata.sharableLinkId}`);
            // Do Not remove this. May need later.
            // this.sharableLink = `${environment.host}share/${res.metadata.sharableLinkId}`;
          }
        },
        error: (error) => {
          // show error from server here
          console.log(error);
        }
      });
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
        next: (data: any) => {
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
    this.selectedDates = [];
    this.selectedDates$.next([]);
    this.addedTimeSlots = [];
    this.broadcaster.broadcast('reset_event');
    const contacts = [...this.emailsWithAvailabilityMap.values()].flat();
    if (contacts.length == 0) {
      return;
    }
    this.broadcaster.broadcast('contact_calendar_data', contacts);
  }

  removeSingleContact(contact: CalendarAccess) {
    this.selectedContacts = this.selectedContacts.filter((res: CalendarAccess) => {
      return res.owner.email != contact.owner.email
    });
    this.selectedEmails = this.selectedEmails.filter((res) => {
      return res != contact.owner.email
    });
    this.selectedContacts$.next(this.selectedContacts);
    this.emailsWithAvailabilityMap.delete(contact.owner.email);
    this.broadcastContactData();
    this.selectedDates = [];
    this.selectedDates$.next([]);
  }

  copyLink(text: string) {
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

  editLink() {
    this.updateView = true;
    this.broadcaster.broadcast('multiselect_calendar', true);
  }

  updateSharableLink() {
    const selectedDates = this.addedTimeSlots;
    if (selectedDates.length == 0) {
      this.errorMessage = 'Please select at least one available time slot';
    } else if (!this.choosedLocationObj) {
      this.errorMessage = 'Please select the Location';
    } else if (this.choosedLocationObj?.value == MeetViaEnum.InboundCall && !this.phoneNumber) {
      this.errorMessage = 'Please enter Phone Number';
    } else if (this.choosedLocationObj?.value == MeetViaEnum.PhysicalAddress && !this.address) {
      this.errorMessage = 'Please enter Address';
    }

    if (this.errorMessage) {
      setTimeout(() => {
        this.errorMessage = '';
      }, 3000);
      return;
    }
    const selectedDatesNew = [];
    for (const key in selectedDates) {
      const value = selectedDates[key];
      selectedDatesNew.push({
        'startDate': value['start'],
        'endDate': value['end']
      });
    }

    const requestParams = {
      'title': this.choosedLocationObj?.title,
      'addSlots': selectedDatesNew,
      'deleteSlots': this.deletedTimeSlots,
      'meetVia': this.choosedLocationObj?.value,
      'attendees': [] as any,
      'phoneNumber': null,
      'address': null
    }

    if (this.selectedContacts.length > 0) {
      requestParams['attendees'] = this.selectedContacts.map(x => x.owner.id);
    }

    if (this.choosedLocationObj?.value == MeetViaEnum.InboundCall) {
      requestParams['phoneNumber'] = this.phoneNumber;
    }
    if (this.choosedLocationObj?.value == MeetViaEnum.PhysicalAddress) {
      requestParams['address'] = this.address;
    }

    this.sharableLinkService.updateLink(this.linkId, requestParams)
      .subscribe({
        next: (res: any) => {
          if (res.status) {
            if (localStorage.getItem('savedDatas')) localStorage.removeItem('savedDatas');
            window.location.reload();
            // route to details page after link creationg for better update functionality
            // TODO: we can use same page. Will determine after update functionality is done in backend
            // this.router.navigate(['/calendar/sharable-link', res.metadata.sharableLinkId]);
            // this.router.navigateByUrl(`/calendar/sharable-link/${res.metadata.sharableLinkId}`);
            // Do Not remove this. May need later.
            // this.sharableLink = `${environment.host}share/${res.metadata.sharableLinkId}`;
          }
        },
        error: (error) => {
          // show error from server here
          console.log(error);
        }
      });
  }

  close() {
    this.broadcaster.broadcast('calendar_full_size', true);
  }

  ngOnDestroy(): void {
    this.broadcaster.broadcast('reset_event');
    this.selectedDates$.unsubscribe();
    this.subscription$.unsubscribe();
  }

}
