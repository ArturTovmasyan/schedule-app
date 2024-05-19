import {Component, OnDestroy, OnInit} from '@angular/core';
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
  styleUrls: ['./my-calendar.component.scss']
})
export class MyCalendarComponent implements OnInit, OnDestroy {
  events: any = [];
  error: any = null;
  calendarApi: any;
  myEvents: any;
  contactEvents: any;
  contactAvailabilityDates: any;
  subscription: BehaviorSubject<boolean>;

  constructor(private calendarService: CalendarService, private broadcaster: BroadcasterService) {
    this.subscription = this.broadcaster.on('contact_calendar_data').subscribe((contactAvailabilities: any) => {
      debugger;
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
    }
  };
}
