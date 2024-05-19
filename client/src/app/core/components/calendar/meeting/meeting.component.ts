import {Component, HostListener, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import * as moment from 'moment-timezone';
import {BehaviorSubject, first} from 'rxjs';
import {Calendar, CalendarData} from 'src/app/core/interfaces/calendar/calendar-data.interface';
import {CreateEventRequest} from 'src/app/core/interfaces/calendar/create-event-request.interface';
import {CalendarService} from 'src/app/core/services/calendar/calendar.service';
import {CalendarPermissionService} from 'src/app/core/services/calendar/permission.service';
import {CommonService} from 'src/app/core/services/common.service';
import {CalendarType} from '../connect-calendar/connect-calendar.component';
import {AvailabilityService} from "../../../services/calendar/availability.service";
import {BroadcasterService} from "../../../../shared/services";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {CalendarAccess} from "../../../interfaces/calendar/calendar-access.interface";
import {CalendarAccessService} from "../../../services/calendar/access.service";
import { UserData } from '../../chip-user-input/chip-user-input.component';
import { SharableLinkService } from 'src/app/core/services/calendar/sharable-link.service';
import { MeetViaEnum } from '../enums/sharable-links.enum';
import { Location } from 'src/app/core/interfaces/calendar/location.interface';

@Component({
  selector: 'app-meeting',
  templateUrl: './meeting.component.html',
  styleUrls: ['./meeting.component.scss']
})
export class MeetingComponent implements OnInit, OnDestroy {

  data: CreateEventRequest = {
    title: "",
    description: "",
    meetLink: "",
    start: "",
    end: "",
    syncWith: "",
    attendees: [],
    optionalAttendees: [],
    duration: 1
  };
  myCalendar: CalendarData | null = null;
  selectedCalendar: Calendar | null = null;
  subscription: BehaviorSubject<boolean>;
  form: FormGroup;
  attendeesOptions: UserData[] = [];
  selectedAttendees: any = [];
  dropdownSettings = {};
  errorMessages: any = [];
  showCalendars = false;
  error = false;

  showRequiredErrors = false;

  // manoj
  emailsWithAvailabilityMap = new Map();
  linkId = '';
  locations: Location[] = [];
  choosedLocationObj: Location | null = null;
  showLocation = false;
  connectMessage = { 'title': '', 'type': '' };
  address = null;
  phoneNumber = null;
  readonly MeetViaEnum = MeetViaEnum;
  errorMessage = '';

  constructor(
    private readonly permissionService: CalendarPermissionService,
    private readonly commonService: CommonService,
    private readonly availabilityService: AvailabilityService,
    private readonly broadcaster: BroadcasterService,
    private readonly service: CalendarAccessService,
    private readonly sharableLinkService: SharableLinkService,
    private formBuilder: FormBuilder,
    private readonly calendarPermissionService: CalendarPermissionService,
    private readonly calendarService: CalendarService
  ) {
    this.fetchMyAttendees();
    this.getLocations();

    this.form = this.formBuilder.group({
      meetTitle: ['', [Validators.required, Validators.minLength(5)]],
      attendees: ['', [Validators.required]],
      duration: ['', [Validators.required]],
      meetingLocation: [''],
    }, {updateOn: 'blur'});

    this.subscription = this.broadcaster.on('meet_date_range').subscribe((eventData: any) => {
      if (eventData.contact_email) {
        this.selectedAttendees = [
          eventData
        ]
        this.data.attendees?.push(eventData.contact_email);
      }

      this.data.start = eventData.start;
      this.data.end = eventData.end;
    });
  }

  ngOnInit(): void {
    this.permissionService.fetchCalendars()
      .pipe(first())
      .subscribe({
        next: (data: CalendarData | any) => {
          this.myCalendar = data;
          if (this.myCalendars.length > 0) {
            this.selectCalendar(this.myCalendars[0]);
          }
        }
      });

    this.dropdownSettings = {
      singleSelection: false,
      enableCheckAll: false,
      idField: 'id',
      textField: 'value',
      itemsShowLimit: 10,
      limitSelection: 10,
      allowSearchFilter: true,
    };
    this.initFormValue();

    // load from saved Data of localstorage after connect redirection
    if (localStorage.getItem('meetingDatas')) {
      this.runAfterRedirect();
    }
  }
  
  // run after connect button is clicked on Location to connect to zoom, meet or teams
  runAfterRedirect() {
    const savedData = localStorage.getItem('meetingDatas') as string;
    if (savedData) {
      const savedDataArr = JSON.parse(savedData);
      this.choosedLocationObj = savedDataArr.choosedLocationObj;
      this.data = savedDataArr.data;
      this.selectedAttendees = savedDataArr.selectedAttendees ?? [];
      this.broadcaster.broadcast('selectUnselectDate', {'startDate': this.data.start, 'endDate': this.data.end});
      if (this.selectedAttendees.length) {
        for (let i=0; i < this.selectedAttendees.length; i++) {
          this.getContactsAvailability(this.selectedAttendees[i]);
        }
      }
      this.onDurationSelectionChanged(this.data.duration!);
      if (!this.choosedLocationObj?.available) {
        // if not connected show connect message
        this.connectMessage = {
          title: this.choosedLocationObj?.title as string,
          type: this.choosedLocationObj?.value as string
        };
      }
    }
  }

  initFormValue(defaultValues: any = null) {
    if (!defaultValues) { 
      defaultValues = {
        'duration': 1 // 1 hour
      }
    }
    this.form.patchValue(defaultValues);
  }

  onItemSelect(item: any) {
    // this.data.attendees?.push(item.value);
    this.updateAttendeeEmails(item);
  }

  onRemoveItem(user: UserData) {
    this.emailsWithAvailabilityMap.delete(user.email);
    this.broadcastContactData();
  }

  ngOnDestroy() {
    if (localStorage.getItem('meetingDatas')) localStorage.removeItem('meetingDatas');
    this.subscription.unsubscribe();
  }

  selectCalendar(calendar: Calendar) {
    this.data.syncWith = calendar.id;
    this.selectedCalendar = calendar;
    this.showCalendars = false;
  }

  getCalendarIcon(type: CalendarType | null): string {
    if (type === CalendarType.Office365Calendar) {
      return 'assets/outlook-icon.svg';
    } else {
      return 'assets/google-icon.svg';
    }
  }

  updateAttendeeEmails(user: UserData) {
    this.getContactsAvailability(user);
  }

  updateFieldError(hasError: boolean) {
    this.error = hasError;
  }

  updateOptionalAttendeeEmails(emails: string[]) {
    this.data.optionalAttendees = emails;
  }

  scheduleEvent() {
    this.errorMessages = [];
    if (this.data.title == '') {
      this.errorMessages.push('Message title is required.')
    }

    if (this.data.start == '') {
      this.errorMessages.push('Date/Time cannot be empty')
    }

    if (!this.choosedLocationObj) {
      this.errorMessages.push('Please select the Location');
    } else if (this.choosedLocationObj?.value == MeetViaEnum.InboundCall && !this.phoneNumber) {
      this.errorMessages.push('Please enter Phone Number');
    } else if (this.choosedLocationObj?.value == MeetViaEnum.PhysicalAddress && !this.address) {
      this.errorMessages.push('Please enter Address');
    }

    if (this.errorMessages.length) {
      this.autoHideErrorMessage(3000);
      return;
    }
    
    if (this.choosedLocationObj?.value == MeetViaEnum.InboundCall) {
      this.data['phoneNumber'] = this.phoneNumber!;
    }
    if (this.choosedLocationObj?.value == MeetViaEnum.PhysicalAddress) {
      this.data['address'] = this.address!;
    }

    this.calendarService.scheduleEvent(this.data)
      .pipe(first())
      .subscribe({
        next: () => {
          this.resetData();
          if (localStorage.getItem('meetingDatas')) localStorage.removeItem('meetingDatas');
        },
        error: (error:any) => {
          this.errorMessages.push(error?.message);
          this.autoHideErrorMessage();
        }
      });
  }

  resetData() {
    this.data = {
      title: "",
      description: "",
      meetLink: "",
      start: "",
      end: "",
      syncWith: this.data.syncWith,
      attendees: [],
      optionalAttendees: [],
      duration: 1,
      phoneNumber: "",
      address: ""
    }
  }

  getContactsAvailability(contact: UserData) {
    const contactId = contact.id;
    const contactEmail = contact.email;
    this.data.attendees?.push(contactEmail);
    if(!contactId) return;

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

      
    // const contactEmails = this.data.attendees;
    // if (contactEmails && contactEmails.length > 0) {
    //   this.availabilityService.getByEmails(contactEmails)
    //     .pipe(first())
    //     .subscribe({
    //       next: (data: any | null) => {
    //         const availabilityData = data?.availabilityData;
    //         const contactData = {
    //           ...availabilityData
    //         }
    //         this.broadcaster.broadcast('contact_calendar_data', contactData);
    //       },
    //       error: (error) => {
    //         console.error(error.message);
    //       }
    //     });
    // } else {
    //   this.broadcaster.broadcast('contact_calendar_data', []);
    // }
  }

  fetchMyAttendees() {
    this.service.fetchAccessibleContacts()
      .pipe(first())
      .subscribe({
        next: (data: CalendarAccess[] | null) => {
          if (data) {
            const contacts = data ?? [];
            this.attendeesOptions = contacts.map((contact) => {
              return {
                id: contact.owner.id,
                name: `${contact.owner.firstName} ${contact.owner.lastName}`,
                email: contact.owner.email,
                avatar: contact.owner.avatar,
                removable: true
              }
            });
          }
        },
        error: (error) => {
          this.error = error;
        }
      });
  }

  broadcastContactData() {
    const contacts = [...this.emailsWithAvailabilityMap.values()].flat();
    this.broadcaster.broadcast('contact_calendar_data', contacts);
    
  }

  updateAttendees(users: UserData[]) {
    this.selectedAttendees = users;
  }

  getLocations() {
    this.sharableLinkService.getLocations()
      .subscribe({
        next: (res: any) => {
          this.locations = res;
        }
      });
  }

  chooseLocation(loc: Location) {
    this.choosedLocationObj = loc;
    this.data.meetLink = loc.value;
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
      data: this.data,
      choosedLocationObj: this.choosedLocationObj,
      selectedAttendees: this.selectedAttendees,
    }
    localStorage.setItem('meetingDatas', JSON.stringify(savedData));
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

  onDurationSelectionChanged(index: number){
    this.form.patchValue({
      'duration': index,
    });
    this.data.duration = index;
    if (index != 4) {
      const newIndex = index+1;
      this.broadcaster.broadcast('timeSLotInterval', 15 * newIndex);
      return;
    }
    this.broadcaster.broadcast('timeSLotInterval', 30);
    
  }

  autoHideErrorMessage(time=3000) {
    setTimeout(() => {
        this.errorMessages = [];
      }, time);
  }

  resetSelectedDate() {
    this.data['start'] = '';
    this.data['end'] = '';
    this.broadcaster.broadcast('selectUnselectDate', {'startDate': '', 'endDate': ''});
  }

  get f() {
    return this.form.controls;
  }

  get myCalendars() {
    const calendars: Calendar[] = []
    this.myCalendar?.googleCalendar?.forEach((item) => {
      calendars.push(item);
    });
    this.myCalendar?.office365Calendar?.forEach((item) => {
      calendars.push(item);
    });
    return calendars;
  }

  get parsedDate(): string {
    let currentDate = this.commonService.getFormattedDateString(moment()) ?? "";
    if (this.data.start) {
      currentDate = this.data.start;
    }
    return this.commonService.getFormattedDateString(moment.utc(currentDate).local(), 'ddd, MMM Do') ?? "";
  }

  get hasCalendars(): boolean {
    return (this.myCalendar?.googleCalendar?.length ?? 0) > 0 || (this.myCalendar?.office365Calendar?.length ?? 0) > 0
  }

  get timezone(): string {
    return this.commonService.localTimezone;
  }
}
