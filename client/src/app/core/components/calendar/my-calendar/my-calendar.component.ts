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
  styleUrls: ['./my-calendar.component.scss'],
})
export class MyCalendarComponent implements OnInit, OnDestroy {
<<<<<<< HEAD
  events: any = [];
  error: any = null;
  calendarApi: any;
  contactEvents: any;
  contactAvailabilityDates: any;
=======
  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;
  @ViewChild('eventDetailView') eventDetailView!: ElementRef;
  @ViewChild('eventCancellationView') eventCancellationView!: ElementRef;

  screenWidth: any;
  screenHeight: any;

>>>>>>> 831cabe (feat: allow user to cancel event)
  subscription: BehaviorSubject<boolean>;
  multiSelectSubscription!: BehaviorSubject<never>;
  initSharableLinkSubscription!: BehaviorSubject<any>;
  reloadEventSubscription!: BehaviorSubject<any>;

  selectedContactEmail = '';
  selectedContactId = '';
  currentUrl = '';
  myEvents: any;
  mySelectedDateEvents: any;
  oldEvents: any;
  initOldEvents$ = new BehaviorSubject(false);

<<<<<<< HEAD
  constructor(private calendarService: CalendarService, private broadcaster: BroadcasterService) {
    this.subscription = this.broadcaster.on('contact_calendar_data').subscribe((contactAvailabilities: any) => {
      const availabilityDates: any[] = [];
      const contactId = contactAvailabilities.contactId;

      if (contactAvailabilities) {
        // delete contactAvailabilities['contactId'];
        for (const key in contactAvailabilities) {
=======
  currentEventSelection: any | null;
  cancellationMessage = "";

  user: UserData = {
    id: '',
    name: '',
    email: '',
    removable: false,
    avatar: null,
  };
>>>>>>> 831cabe (feat: allow user to cancel event)

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
    plugins: [
      dayGridPlugin,
      bootstrapPlugin,
      interactionPlugin,
      timeGridPlugin,
      rrulePlugin,
      interactionPlugin,
    ],
    initialView: 'timeGridWeek',
    dayHeaderFormat: { weekday: 'short', day: '2-digit', omitCommas: true },
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
        separator: '.',
      },
    ],
    titleFormat: {
      month: 'long',
      day: 'numeric',
    },
    eventTimeFormat: {
      hour: 'numeric',
      minute: '2-digit',
      meridiem: 'short',
      hour12: true,
    },
    headerToolbar: {
      left: '',
      center: 'prev,title,next',
      right: '',
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
    select: (info: any) => {
      this.currentUrl = this.router.url;

      if (this.currentUrl.indexOf('/calendar/sharable-link') != -1) {
        this.runSharableLink(info);
        return;
      }

      const data = { start: info.startStr, end: info.endStr };

      if (this.selectedContactEmail) {
        Object.assign(data, {
          contact_email: this.selectedContactEmail,
          contact_id: this.selectedContactId,
        });
      }

      setTimeout(() => {
        this.broadcaster.broadcast('meet_date_range', data);
      }, 0);

      if (
        this.currentUrl !== '/calendar/meeting' &&
        this.currentUrl != '/calendar/sharable-link'
      ) {
        this.router.navigate(['/calendar/meeting']);
      }
    },
    selectOverlap: function (info: any) {
      return (
        info._def.ui.classNames[0] == AVAILABILITY_EVENT_CLASS ||
        info._def.ui.classNames[0] == SUGGEST_EVENT_CLASS
      );
    },
    eventClick: (info) => {
      const { el, jsEvent, view } = info;
      const elX = jsEvent.clientX - jsEvent.offsetX;
      const elY = jsEvent.clientY - jsEvent.offsetY;
      const xOffset = elX < this.screenWidth * 0.65 ? 10 : -420;
      var yOffset = 0;
      if (elY > this.screenHeight * 0.65) yOffset = -300;
      else if (elY < this.screenHeight * 0.4) yOffset = 10;
      else yOffset = -100;

      this.eventDetailView.nativeElement.style.top = `${elY + yOffset}px`;
      this.eventDetailView.nativeElement.style.left = `${
        elX + el.clientWidth + xOffset
      }px`;

      this.currentEventSelection = info.event;
      this.showDetail();
    },
  };

  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    this.screenWidth = window.innerWidth;
    this.screenHeight = window.innerHeight;
  }

  ngOnInit(): void {
    this.screenWidth = window.innerWidth;
    this.screenHeight = window.innerHeight;
    this.fetchMyEvents();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.initSharableLinkSubscription.unsubscribe();
    this.multiSelectSubscription.unsubscribe();
    this.reloadEventSubscription.unsubscribe();
  }

  fetchMyEvents() {
    this.calendarService
      .fetchEvents()
      .pipe(first())
      .subscribe({
        next: (events: any) => {
          const data: any[] = [];
          const dateFormatter = (start: string, end: string) => {
            const startDate = moment.parseZone(start);
            const endDate = moment.parseZone(end);
            return `${startDate.tz(moment.tz.guess()).format(
              'dddd, MMM DD hh:mm A'
            )} - ${endDate.format('hh:mm A')}`;
          };
          if (events.length > 0) {
            events.forEach((el: any) => {
              const users = el.attendees.map((item: any) => {
                return {
                  email: item.email,
                  avatar: null,
                  removable: false,
                  status: item.responseStatus,
                  optional: item.optional ?? false,
                };
              });

              const obj = {
                id: el.id,
                title: el.title,
                description: el.description,
                datetime: dateFormatter(el.start, el.end),
                attendees: users.filter((item: any) => !item.optional),
                optional_attendees: users.filter((item: any) => item.optional),
                link: el.meetLink,
                calendar: el.calendar.summary,
                calendarIcon: el.calendar.calendarType == CalendarType.GoogleCalendar ? 'google-icon.svg' : 'outlook-icon.svg',
              };

              if (el.allDay) {
                this.calendarOptions.allDaySlot = el.allDay;
                Object.assign(obj, {
                  start: new Date(el.start),
                  allDay: new Date(el.allDay),
                });
              } else {
                Object.assign(obj, {
                  start: new Date(el.start),
                  end: new Date(el.end),
                });
              }

              data.push(obj);
            });

            if (this.mySelectedDateEvents) {
              this.myEvents = [...data].concat(this.mySelectedDateEvents);
              this.calendarOptions.events = [...data].concat(
                this.mySelectedDateEvents
              );
              this.oldEvents = [...data].concat(this.mySelectedDateEvents);
            } else {
              this.myEvents = data;
              this.calendarOptions.events = data;
              this.oldEvents = data;
            }
          }
        },
      });
  }

  getLocaleTime(date: string): string {
    const offset = moment().utcOffset() / 60;
    const utcTime = moment(date).add(offset, 'hour');
    return this.commonService.getFormattedDateString(utcTime, 'HH:mm') ?? '';
  }

  runSharableLink(info: any) {
    const selectedData = this.mySelectedDateEvents?.length
      ? this.mySelectedDateEvents
      : [];
    selectedData.push({
      start: info.start,
      end: info.end,
      display: 'background',
      overlap: false,
      color: '#83b4f0',
    });
    this.mySelectedDateEvents = selectedData;
    this.calendarOptions.events = [...this.oldEvents].concat(selectedData);
    this.broadcaster.broadcast('selectSharableLinkDates', {
      start: info.start,
      end: info.end,
      display: 'background',
      overlap: false,
      color: '#83b4f0',
    });
  }

  showDetail() {
    if (this.currentEventSelection) this.eventDetailView.nativeElement.classList.remove('hidden');
  }

  closeDetail() {
    this.eventDetailView.nativeElement.classList.add('hidden');
  }

  navigateToDetail(eventId: string): void {
    this.closeDetail();
    this.router.navigate([`/calendar/meeting/${eventId}`]);
  }

  cancelMeeting(withMessage: boolean = true): void {
    if (this.currentEventSelection) {
      if (!withMessage) this.cancellationMessage = '';
      this.calendarService
        .cancelEvent(this.currentEventSelection.id, this.cancellationMessage)
        .pipe(first())
        .subscribe({
          next: () => {
            this.broadcaster.broadcast('reset_event');
            this.closeCancellation(false);
          },
          error: (e) => {
            console.log(e);
          }
        });
    }
  }
  
  showCancellation(): void {
    this.closeDetail();
    this.eventCancellationView.nativeElement.classList.remove('hidden');
  }

  closeCancellation(showDetail: boolean = true): void {
    this.eventCancellationView.nativeElement.classList.add('hidden');
    if (showDetail) this.showDetail();
  }

  handleEventMouseEnter(arg: any) {
    // TODO: SHOW BUTTON ON HOVER OF EVENT. DONOT DELETE
    // console.log('Event mouse enter:', arg);
  }

  handleEventMouseLeave(arg: any) {
    // TODO: SHOW BUTTON ON HOVER OF EVENT. DONOT DELETE
    // console.log('Event mouse leave:', arg);
  }
>>>>>>> 831cabe (feat: allow user to cancel event)
}
