import {Component, OnDestroy, OnInit} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment-timezone';
import { BehaviorSubject, first } from 'rxjs';
import {
  Calendar,
  CalendarData,
} from 'src/app/core/interfaces/calendar/calendar-data.interface';
import { CreateEventRequest } from 'src/app/core/interfaces/calendar/create-event-request.interface';
import { CalendarService } from 'src/app/core/services/calendar/calendar.service';
import { CalendarPermissionService } from 'src/app/core/services/calendar/permission.service';
import { CommonService } from 'src/app/core/services/common.service';
import { CalendarType } from '../connect-calendar/connect-calendar.component';
import { AvailabilityService } from '../../../services/calendar/availability.service';
import { BroadcasterService } from '../../../../shared/services';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CalendarAccess } from '../../../interfaces/calendar/calendar-access.interface';
import { CalendarAccessService } from '../../../services/calendar/access.service';
import { UserData } from '../../chip-user-input/chip-user-input.component';
import { SharableLinkService } from 'src/app/core/services/calendar/sharable-link.service';
import { MeetViaEnum } from '../enums/sharable-links.enum';
import { Location } from 'src/app/core/interfaces/calendar/location.interface';
import { ApiResponse } from 'src/app/core/interfaces/response/api.response.interface';

@Component({
  selector: 'app-meeting',
  templateUrl: './meeting.component.html',
  styleUrls: ['./meeting.component.scss'],
})
export class MeetingComponent implements OnInit, OnDestroy {
  data: CreateEventRequest = {
    title: '',
    description: '',
    start: '',
    end: '',
    entanglesLocation: '',
    calendarId: '',
    attendees: [],
    optionalAttendees: [],
    duration: 1,
  };
  myCalendar: CalendarData | null = null;
  selectedCalendar: Calendar | null = null;
  subscription: BehaviorSubject<boolean>;
  form: FormGroup;
  attendeesOptions: UserData[] = [];
  selectedAttendees: UserData[] = [];
  selectedOptionalAttendees: UserData[] = [];
  dropdownSettings = {};
  errorMessages: any = [];
  showCalendars = false;
  error = false;

  showRequiredErrors = false;

  currentEventId: string|null = null;

  // manoj
  emailsWithAvailabilityMap = new Map();
  linkId = '';
  locations: Location[] = [];
  choosedLocationObj: Location | null = null;
  showLocation = false;
  connectMessage = { title: '', type: '' };
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
    private readonly calendarService: CalendarService,
    private readonly route: ActivatedRoute
  ) {
    this.form = this.formBuilder.group(
      {
        meetTitle: ['', [Validators.required, Validators.minLength(5)]],
        attendees: ['', [Validators.required]],
        duration: ['', [Validators.required]],
        meetingLocation: [''],
      },
      { updateOn: 'blur' }
    );

    this.dropdownSettings = {
      singleSelection: false,
      enableCheckAll: false,
      idField: 'id',
      textField: 'value',
      itemsShowLimit: 10,
      limitSelection: 10,
      allowSearchFilter: true,
    };
    // TODO: Check
    this.subscription = this.broadcaster
      .on('meet_date_range')
      .subscribe((eventData: any) => {
        if (eventData.contact_email) {
          this.selectedAttendees = [eventData];
          this.data.attendees?.push(eventData.contact_email);
        }

        this.data.start = eventData.start;
        this.data.end = eventData.end;
      });
  }

  ngOnInit(): void {
    this.fetchMyAttendees();
    this.getLocations();
    this.permissionService
      .fetchCalendars()
      .pipe(first())
      .subscribe({
        next: (data: CalendarData | any) => {
          this.myCalendar = data;
          if (this.myCalendars.length > 0) {
            this.selectCalendar(this.myCalendars[0]);
          }
        },
      });
    this.route.paramMap.subscribe((paramMap) => {
      this.currentEventId = paramMap.get('id');
      if (this.currentEventId != null) this.fetchEventDetail(this.currentEventId);
      else this.initializeForm(); // this.initFormValue();
    });

    // load from saved Data of localstorage after connect redirection
    if (localStorage.getItem('meetingDatas')) {
      this.runAfterRedirect();
    }
  }

  fetchEventDetail(id: string) {
    this.calendarService.fetchEventDetail(id)
      .pipe(first())
      .subscribe({
        next: (event) => {
          this.resetData();
          this.initializeForm(event);
        },
        error: (err) => {
          console.log(err);
        }
      })
  }

  initializeForm(event: any|null = null) {
    if (event) {
      this.data = {
        title: event.title,
        description: event.description ?? "",
        start: event.start,
        end: event.end,
        entanglesLocation: event.entanglesLocation,
        calendarId: event.externalId,
        attendees: [],
        optionalAttendees: [],
        phoneNumber: event.phoneNumber,
        address: event.address,
        duration: 1,
      }
      this.form.setValue(this.data);
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
      this.selectedOptionalAttendees = savedDataArr.selectedOptionalAttendees ?? [];
      this.broadcaster.broadcast('selectUnselectDate', {
        startDate: this.data.start,
        endDate: this.data.end,
      });
      if (this.selectedAttendees.length) {
          this.getContactAvailabilities();
      }
      // this.onDurationSelectionChanged(this.data.duration!);
      if (!this.choosedLocationObj?.available) {
        // if not connected show connect message
        this.connectMessage = {
          title: this.choosedLocationObj?.title as string,
          type: this.choosedLocationObj?.value as string,
        };
      }
    }
  }

  initFormValue(defaultValues: any = null) {
    if (!defaultValues) {
      defaultValues = {
        duration: 1, // 1 hour
      };
    }
    this.form.patchValue(defaultValues);
  }

  updateAttendees(users: UserData[], isOptional: boolean = false) {
    if (isOptional) {
      this.selectedOptionalAttendees = users;
    } else {
      this.selectedAttendees = users;
      if(this.selectedAttendees.length > 0) {
        this.getContactAvailabilities();
      } else {
        this.broadcaster.broadcast('reset_event');
      }
    }

  }

  onItemSelect(user: UserData, isOptional: boolean = false) {
    if ((this.data.attendees?.indexOf(user.email) ?? -1) >= 0 || (this.data.attendees?.indexOf(user.email) ?? -1) >= 0) {
      this.onRemoveItem(user, isOptional) 
    } else if (!isOptional) {
      this.data.attendees?.push(user.email);
    } else if (isOptional) {
      this.data.optionalAttendees?.push(user.email);
    }
  }

  onRemoveItem(user: UserData, isOptional: boolean = false) {
    if (isOptional) {
      const index = this.data.optionalAttendees?.indexOf(user.email) ?? -1;
      if (index != -1) { 
        this.data.optionalAttendees?.splice(index, 1);
      }
    } else {
      const index = this.data.attendees?.indexOf(user.email) ?? -1;
      if (index != -1) { 
        this.data.attendees?.splice(index, 1);
      }
    }
  }

  getContactAvailabilities() {
    this.availabilityService
      .getByUserId([...this.selectedAttendees.map((user) => user.id!)])
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.broadcastContactData(data?.availabilityData);
        },
        error: (error) => {
          console.error(error.message);
        },
      });
  }

  ngOnDestroy() {
    if (localStorage.getItem('meetingDatas'))
      localStorage.removeItem('meetingDatas');
    this.subscription.unsubscribe();
  }

  selectCalendar(calendar: Calendar) {
    this.data.calendarId = calendar.id;
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

  updateFieldError(hasError: boolean) {
    this.error = hasError;
  }

  updateOptionalAttendeeEmails(emails: string[]) {
    this.data.optionalAttendees = emails;
  }

  scheduleEvent() {
    this.errorMessages = [];
    if (this.data.title == '') {
      this.errorMessages.push('Message title is required.');
    }

    if (this.data.start == '') {
      this.errorMessages.push('Select a time for the meeting.');
    }

    if (!this.choosedLocationObj) {
      this.errorMessages.push('Please select the location.');
    } else if (
      this.choosedLocationObj?.value == MeetViaEnum.InboundCall &&
      !this.phoneNumber
    ) {
      this.errorMessages.push('Please enter a phone number.');
    } else if (
      this.choosedLocationObj?.value == MeetViaEnum.PhysicalAddress &&
      !this.address
    ) {
      this.errorMessages.push('Please enter an address.');
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

    this.calendarService
      .scheduleEvent(this.data)
      .pipe(first())
      .subscribe({
        next: () => {
          this.resetData();
          if (localStorage.getItem('meetingDatas')) {
            localStorage.removeItem('meetingDatas');
          }
        },
        error: (error: any) => {
          this.errorMessages.push(error?.message);
          this.autoHideErrorMessage();
        },
      });
  }

  resetData() {
    this.data = {
      title: '',
      description: '',
      start: '',
      end: '',
      calendarId: this.data.calendarId,
      attendees: [],
      optionalAttendees: [],
      duration: 1,
      phoneNumber: '',
      address: '',
    };
    this.selectedAttendees = [];
    this.selectedOptionalAttendees = [];
    this.broadcaster.broadcast('reset_event');
  }

  fetchMyAttendees() {
    this.service
      .fetchAccessibleContacts()
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
                removable: true,
              };
            });
          }
        },
        error: (error) => {
          this.error = error;
        },
      });
  }

  broadcastContactData(availabilityData: any) {
    if (availabilityData.length != 0) {
      this.broadcaster.broadcast('contact_calendar_data', availabilityData);
    }
  }

  getLocations() {
    this.sharableLinkService.getLocations().subscribe({
      next: (res: any) => {
        this.locations = res;
      },
    });
  }

  chooseLocation(loc: Location) {
    this.choosedLocationObj = loc;
    this.data.entanglesLocation = loc.value;
    this.showLocation = false;
    if (
      ![MeetViaEnum.Zoom, MeetViaEnum.GMeet, MeetViaEnum.Teams].includes(
        loc.value
      )
    ) {
      // if incoming and outgoing and address is choosed from location option
      // no need to check for connection of location choosed
      this.connectMessage = {
        title: '',
        type: '',
      };
      return;
    }

    if (!loc.available) {
      // if not connected show connect message
      this.connectMessage = {
        title: loc.title,
        type: loc.value,
      };
    } else {
      this.connectMessage = {
        title: '',
        type: '',
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
      selectedOptionalAttendees: this.selectedOptionalAttendees,
    };
    localStorage.setItem('meetingDatas', JSON.stringify(savedData));
    localStorage.setItem('calendar-redirect', window.location.pathname);
    let connectApiReq = null;
    if (type == MeetViaEnum.Zoom) {
      this.calendarPermissionService.connectZoom().subscribe({
        next: (url: string) => {
          window.location.href = url;
        },
      });
    }

    if (type == MeetViaEnum.GMeet) {
      connectApiReq = this.calendarPermissionService.connectGoogleCalendar();
    }

    if (type == MeetViaEnum.Teams) {
      connectApiReq = this.calendarPermissionService.connectOffice365Calendar();
    }

    if (connectApiReq) {
      connectApiReq.subscribe({
        next: (url: string) => {
          window.location.href = url;
        },
      });
    }
  }

  onDurationSelectionChanged(index: number) {
    this.form.patchValue({
      duration: index,
    });
    this.data.duration = index;
    if (index != 4) {
      const newIndex = index + 1;
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
    this.broadcaster.broadcast('selectUnselectDate', {
      startDate: '',
      endDate: '',
    });
  }

  get f() {
    return this.form.controls;
  }

  get myCalendars() {
    const calendars: Calendar[] = [];
    this.myCalendar?.googleCalendar?.forEach((item) => {
      calendars.push(item);
    });
    this.myCalendar?.office365Calendar?.forEach((item) => {
      calendars.push(item);
    });
    return calendars;
  }

  get parsedDate(): string {
    let currentDate = this.commonService.getFormattedDateString(moment()) ?? '';
    if (this.data.start) {
      currentDate = this.data.start;
    }
    return (
      this.commonService.getFormattedDateString(
        moment.utc(currentDate).local(),
        'ddd, MMM Do YYYY'
      ) ?? ''
    );
  }

  get hasCalendars(): boolean {
    return (
      (this.myCalendar?.googleCalendar?.length ?? 0) > 0 ||
      (this.myCalendar?.office365Calendar?.length ?? 0) > 0
    );
  }

  get timezone(): string {
    return this.commonService.localTimezone;
  }
}
