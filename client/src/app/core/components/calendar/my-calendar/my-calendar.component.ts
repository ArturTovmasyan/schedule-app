import {Component,  OnDestroy, OnInit} from '@angular/core';
import {CalendarOptions} from "@fullcalendar/angular";
import {first} from "rxjs/operators";
import {CalendarService} from "../../../services/calendar/calendar.service";
import DateConverter from "../../helpers/date.converter";
import {BroadcasterService} from "../../../../shared/services";
import {BehaviorSubject} from "rxjs";
import {CalendarEvent} from "../../../interfaces/calendar/calendar-event.interface";

@Component({
  selector: 'app-my-calendar',
  templateUrl: './my-calendar.component.html',
})
export class MyCalendarComponent implements OnInit, OnDestroy {
  events: any = [];
  error: any = null;
  calendarApi: any;
  contactEvents: any;
  contactAvailabilityDates: any;
  subscription: BehaviorSubject<boolean>;
  selectedContactEmail: string = '';
  selectedContactId: string = '';
  currentUrl: string = '';
  myEvents: any;

  constructor(private calendarService: CalendarService, private broadcaster: BroadcasterService) {
    this.subscription = this.broadcaster.on('contact_calendar_data').subscribe((contactAvailabilities: any) => {
      const availabilityDates: any[] = [];
      const contactId = contactAvailabilities.contactId;

      if (contactAvailabilities) {
        // delete contactAvailabilities['contactId'];
        for (const key in contactAvailabilities) {

          availabilityDates.push({
            //TODO convert to local time zone
            // start: DateConverter.convertUTCDateToLocalDate(new Date(contactAvailabilities[key].start)),
            // end: DateConverter.convertUTCDateToLocalDate(new Date(contactAvailabilities[key].end)),
            start: contactAvailabilities[key].start,
            end: contactAvailabilities[key].end,
            className: 'available-event'
          })
        }

        this.contactAvailabilityDates = availabilityDates;

        // this.fetchContactEvents(contactId);
        this.calendarOptions.events = this.myEvents.concat(availabilityDates);
        //TODO compare with my events and availability
      }
<<<<<<< HEAD
=======

      // init calendar options dynamically
      if (availabilityDates && availabilityDates.length > 0) {
        this.calendarOptions.selectable = true;
        this.calendarOptions.slotDuration = '00:30:00';
        this.calendarOptions.slotLabelInterval = 30;
        this.calendarOptions.businessHours = availabilityDates;
        this.calendarOptions.selectConstraint = "businessHours";

        this.calendarOptions.validRange = {
          start: moment().toDate(),
          end: moment().add(2, 'year').toDate(),
        }

      } else {
        delete this.calendarOptions.validRange;
        this.calendarOptions.selectable = false;
        this.calendarOptions.businessHours = [];
        this.broadcaster.broadcast('meet_date_range', []);
      }

      this.calendarOptions.events = this.myEvents ? this.myEvents.concat(availabilityEvents) : availabilityEvents;
>>>>>>> abd03ae (Finish recurrence event functionality)
    });
  }

  ngOnInit(): void {
    this.fetchMyEvents();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  fetchMyEvents() {
    this.calendarService.fetchEvents()
      .pipe(first())
      .subscribe({
        next: (events: any) => {
          const data: any[] = [];
          if (events.length > 0) {
            events.forEach((el: any) => {
              data.push({
                // start: DateConverter.convertUTCDateToLocalDate(new Date(el.start)),
                // end: DateConverter.convertUTCDateToLocalDate(new Date(el.end)),
                start: el.start,
                end: el.end,
                title: el.title,
                description: el.description
              })
            })
            this.myEvents = data;
            this.calendarOptions.events = data;
          }
        },
        error: (error) => {
          this.error = error;
        }
      });
  }

  fetchContactEvents(userId: string) {
    this.calendarService.fetchContactEvents(userId)
      .pipe(first())
      .subscribe({
        next: (events: any) => {
          const data: any[] = [];
          if (events.length > 0) {
            events.forEach((el: any) => {
              data.push({
                start: DateConverter.convertUTCDateToLocalDate(new Date(el.start)),
                end: DateConverter.convertUTCDateToLocalDate(new Date(el.end)),
                className: 'available-event'
              })
            })
            this.contactEvents = data;
            // this.calendarOptions.events = data;
          }
        },
        error: (error) => {
          this.error = error;
        }
      });
  }

  calendarOptions: CalendarOptions = {
    initialView: 'timeGridWeek',
    dayHeaderFormat: {weekday: 'short', day: '2-digit', omitCommas: true},
    direction: 'ltr',
    themeSystem: 'bootstrap',
    dayHeaders: true,
    allDaySlot: false,
    eventTextColor: 'black',
    eventBackgroundColor: '#E9F6FD',
    eventOrderStrict: true,
    stickyHeaderDates: true,
    windowResizeDelay: 100,
    dragRevertDuration: 500,
    handleWindowResize: false,
    expandRows: false,
    showNonCurrentDates: false,
    lazyFetching: false,
    slotLabelFormat: [
      {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        meridiem: 'lowercase',
        separator: '.'
      }
    ],
    titleFormat: {
      month: 'long', day: 'numeric'
    },
    eventTimeFormat: {
      hour: 'numeric',
      minute: '2-digit',
      meridiem: 'short',
      hour12: true
    },
    headerToolbar: {
      left: '',
      center: 'prev,title,next',
      right: 'today'
    },
    events: [],
    eventContent: this.eventContent.bind(this),
    eventClassNames: function () {
      return 'event';
<<<<<<< HEAD
    }
  };
=======
    },
    select: (info) => {
      this.currentUrl = this.router.url;
      let data = {start: info.startStr, end: info.endStr};

      if (this.selectedContactEmail) {
        Object.assign(data, {
          contact_email: this.selectedContactEmail,
          contact_id: this.selectedContactId,
        })
      }

      setTimeout(() => {
        this.broadcaster.broadcast('meet_date_range', data);
      }, 0);

      if (this.currentUrl !== '/calendar/meeting') {
        this.router.navigate(['/calendar/meeting'])
      }
    },
    selectOverlap: function (info) {
      return (info._def.ui.classNames[0] == AVAILABILITY_EVENT_CLASS) || (info._def.ui.classNames[0] == SUGGEST_EVENT_CLASS);
    },
  }

  ngOnInit(): void {
    this.fetchMyEvents();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  fetchMyEvents() {
    this.calendarService.fetchEvents()
      .pipe(first())
      .subscribe({
        next: (events: any) => {
          const data: any[] = [];
          if (events.length > 0) {
            events.forEach((el: any) => {
              let obj = {
                title: el.title,
                description: el.description,
              };

              if (el.allDay) {
                this.calendarOptions.allDaySlot = el.allDay;
                Object.assign(obj, {
                   start: el.start,
                   allDay: el.allDay,
                 });
              } else {
                Object.assign(obj, {
                  start: DateConverter.convertToLocalDate(new Date(el.start)),
                  end: DateConverter.convertToLocalDate(new Date(el.end)),
                });
              }

              data.push(obj)
            })

            this.myEvents = data;
            this.calendarOptions.events = data;
          }
        },
      });
  }

  eventContent(arg: any) {
    let divEl = document.createElement('div');
    let title = arg.event.title;
    let time = arg.timeText;

    if (title) {
      divEl.innerHTML = '<span>' + title + '</span><br/><span style="color: #047BDAFF; font-size: 8pt; text-wrap: avoid">' + time + '</span>';
    } else {
      divEl.innerHTML = '<span style="color: #047BDAFF;font-size: 8pt; text-wrap: avoid">' + time + '</span>';
    }
    return {html: divEl.innerHTML};
  }

  getLocaleTime(date: string): string {
    let offset = moment().utcOffset() / 60;
    let utcTime = moment(date).add(offset, 'hour');
    return this.commonService.getFormattedDateString(utcTime, 'HH:mm') ?? "";
  }
>>>>>>> abd03ae (Finish recurrence event functionality)
}
