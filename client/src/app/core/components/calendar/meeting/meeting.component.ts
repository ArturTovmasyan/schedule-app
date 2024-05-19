import {Component, OnDestroy, OnInit} from '@angular/core';
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
import {BroadcasterService, ValidationService} from "../../../../shared/services";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {CalendarAccess} from "../../../interfaces/calendar/calendar-access.interface";
import {CalendarAccessService} from "../../../services/calendar/access.service";

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
    optionalAttendees: []
  };
  myCalendar: CalendarData | null = null;
  selectedCalendar: Calendar | null = null;
  subscription: BehaviorSubject<boolean>;
  form: FormGroup;
  attendeesOptions: { id: string, value: string }[] = [];
  selectedAttendees: any = [];
  dropdownSettings = {};
  errorMessages: any = [];
  showCalendars = false;
  selectEvent = false;
  error = false;

  constructor(
    private readonly router: Router,
    private readonly calendarService: CalendarService,
    private readonly permissionService: CalendarPermissionService,
    private readonly commonService: CommonService,
    private readonly availabilityService: AvailabilityService,
    private readonly broadcaster: BroadcasterService,
    private readonly service: CalendarAccessService,
    private formBuilder: FormBuilder,
  ) {
    this.fetchMyAttendees();

    this.form = this.formBuilder.group({
      meetTitle: ['', [Validators.required, Validators.minLength(5)]],
      attendees: ['', [Validators.required]],
      meetingLocation: ['', [Validators.required, ValidationService.urlValidator]],
    });

    this.subscription = this.broadcaster.on('meet_date_range').subscribe((eventData: any) => {
      if (eventData.contact_email) {
        this.selectedAttendees = [
          {id: eventData.contact_id, value: eventData.contact_email}
        ]
        this.data.attendees?.push(eventData.contact_email);
      }

      this.data.start = eventData.start;
      this.data.end = eventData.end;
      this.selectEvent = this.data.attendees?.length != 0;
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
  }

  onItemSelect(item: any) {
    this.data.attendees?.push(item.value);
    this.updateAttendeeEmails();
  }

  onRemoveItem($event: any) {
    const index = this.data.attendees?.indexOf($event.value);
    if (index !== -1) {
      // @ts-ignore
      this.data.attendees?.splice(index, 1);
    }

    this.updateAttendeeEmails();
  }

  ngOnDestroy() {
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

  parsedStartTime(startDate: string): string {
    if (startDate) {
      return this.commonService.getFormattedDateString(moment.utc(startDate).local(), 'hh:mmA') ?? "";
    }

    return "";
  }

  parsedEndTime(endDate: string): string {
    if (endDate) {
      return this.commonService.getFormattedDateString(moment.utc(endDate).local(), 'hh:mmA') ?? "";
    }
    return "";
  }

  updateAttendeeEmails() {
    this.getContactsAvailability();
  }

  updateFieldError(hasError: boolean) {
    this.error = hasError;
  }

  updateOptionalAttendeeEmails(emails: string[]) {
    this.data.optionalAttendees = emails;
  }

  scheduleEvent() {
    if (this.form.invalid) {
      return;
    }

    this.errorMessages = [];
    this.data.title = this.form.get('meetTitle')?.value;
    this.data.meetLink = this.form.get('meetingLocation')?.value;

    this.calendarService.scheduleEvent(this.data)
      .pipe(first())
      .subscribe({
        next: () => {
          this.resetData();
        },
        error: (error) => {
          this.errorMessages.push(error?.message);
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
      syncWith: "",
      attendees: [],
      optionalAttendees: []
    }
  }

  getContactsAvailability() {
    const contactEmails = this.data.attendees;
    if (contactEmails && contactEmails.length > 0) {
      this.availabilityService.getByEmails(contactEmails)
        .pipe(first())
        .subscribe({
          next: (data: any | null) => {
            const availabilityData = data?.availabilityData;
            const contactData = {
              ...availabilityData
            }
            this.broadcaster.broadcast('contact_calendar_data', contactData);
          },
          error: (error) => {
            console.error(error.message);
          }
        });
    } else {
      this.broadcaster.broadcast('contact_calendar_data', []);
    }
  }

  fetchMyAttendees() {
    this.service.fetchAccessibleContacts()
      .pipe(first())
      .subscribe({
        next: (data: CalendarAccess[] | null) => {
          if (data) {
            data.map((item: any) => {
              let email = item?.owner?.email;
              let id = item?.owner?.id;

              if (this.attendeesOptions.indexOf(email) === -1) {
                this.attendeesOptions.push({
                  id: id,
                  value: email
                });
              }
            });

            this.attendeesOptions = [...this.attendeesOptions]
          }
        },
        error: (error) => {
          this.error = error;
        }
      });
  }

  close() {
    this.router.navigate(['/calendar/contacts'])
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
