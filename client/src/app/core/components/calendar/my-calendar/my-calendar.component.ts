import {
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FullCalendarComponent } from '@fullcalendar/angular';
import { CalendarOptions, DateInput } from '@fullcalendar/core';
import { first } from 'rxjs/operators';
import { CalendarService } from '../../../services/calendar/calendar.service';
import { BroadcasterService } from '../../../../shared/services';
import { BehaviorSubject } from 'rxjs';
import * as moment from 'moment-timezone';
import { Router } from '@angular/router';
import { CommonService } from '../../../services/common.service';
import {
  AVAILABILITY_EVENT_CLASS,
  SUGGEST_EVENT_CLASS,
} from '../../../interfaces/constant/calendar.constant';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import bootstrapPlugin from '@fullcalendar/bootstrap';
import rrulePlugin from '@fullcalendar/rrule';
import { UserData } from '../../chip-user-input/chip-user-input.component';
import { CalendarType } from '../connect-calendar/connect-calendar.component';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-my-calendar',
  templateUrl: './my-calendar.component.html',
  styleUrls: ['./my-calendar.component.scss'],
})
export class MyCalendarComponent implements OnInit, OnDestroy {
  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;
  @ViewChild('eventDetailView') eventDetailView!: ElementRef;
  @ViewChild('eventCancellationView') eventCancellationView!: ElementRef;

  screenWidth: any;
  screenHeight: any;

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

  currentEventSelection: any | null;
  cancellationMessage = "";

  showSyncCal = false;

  user: UserData = {
    id: '',
    name: '',
    email: '',
    removable: false,
    avatar: null,
  };

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
    editable: false,
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
    firstDay: 1,
    unselectAuto: false,
    windowResize: (view: any) => {
      view.view.calendar.updateSize();
    },
    eventMouseEnter: (arg: any) => this.handleEventMouseEnter(arg),
    eventMouseLeave: (arg: any) => this.handleEventMouseLeave(arg),
    selectable: true,
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
    eventClassNames: function (arg) {
      return `event ${arg.event.extendedProps['event_class']}`;
    },
    select: (info: any) => {
      // prevent multi-day event selection
      var mEnd = moment(info.endStr);
      var mStart = moment(info.startStr);
      if (mEnd.isAfter(mStart, 'day')) {
        this.calendarComponent?.getApi()?.unselect();
        this.broadcaster.broadcast('meet_date_range', { start: '', end: ''});
        return;
      }

      // check for shareable link
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

  constructor(
    private calendarService: CalendarService,
    private broadcaster: BroadcasterService,
    private readonly commonService: CommonService,
    private readonly router: Router
  ) {
    this.showSyncCal = !environment.production
    this.subscription = this.broadcaster.on('reset_event').subscribe(() => {
      this.fetchMyEvents();
      this.calendarOptions.events = this.myEvents;
      this.calendarOptions.selectConstraint = undefined;
      this.mySelectedDateEvents = [];
      this.oldEvents = this.myEvents ? [...this.myEvents] : [];
      this.closeDetail();
    });

    this.subscription = this.broadcaster
      .on('contact_calendar_data')
      .subscribe((dates: any) => {
        const availabilityDates: any[] = [];
        const availabilityEvents: any[] = [];
        this.selectedContactEmail = dates.contactEmail ?? null;
        this.selectedContactId = dates.contactId ?? null;

        if (this.selectedContactEmail) {
          delete dates.contactEmail;
        }

        if (this.selectedContactId) {
          delete dates.contactId;
        }

        for (const key in dates) {
          let className = AVAILABILITY_EVENT_CLASS;
          if (+key === 0) {
            className = SUGGEST_EVENT_CLASS;
          }

          availabilityEvents.push({
            start: new Date(dates[key].start),
            end: new Date(dates[key].end),
            className: className,
            groupId: 'availableSlot',
            display: 'background',
          });

          const weekDay = new Date(dates[key].start).getDay();
          availabilityDates.push({
            daysOfWeek: [weekDay],
            startTime: new Date(dates[key].start),
            endTime: new Date(dates[key].end),
          });
        }
        // init calendar options dynamically
        if (availabilityDates && availabilityDates.length > 0) {
          this.calendarOptions.slotDuration = '00:30:00';
          this.calendarOptions.slotLabelInterval = 30;

          this.calendarOptions.validRange = {
            start: moment().subtract(1, 'month').toDate(),
            end: moment().add(2, 'year').toDate(),
          };
        } else {
          this.calendarOptions.validRange = undefined;
          this.calendarOptions.selectable = false;
          this.broadcaster.broadcast('meet_date_range', []);
        }
        const myEv = this.myEvents ? [...this.myEvents] : [];
        this.calendarOptions.events = this.myEvents
          ? myEv.concat(availabilityEvents)
          : availabilityEvents;
        this.oldEvents = this.oldEvents
          ? myEv.concat(availabilityEvents)
          : availabilityEvents;
      });

    this.reloadEventSubscription = this.broadcaster
      .on('reload_events')
      .subscribe(() => {

      });

    this.multiSelectSubscription = this.broadcaster
      .on('multiselect_calendar')
      .subscribe((selectable: boolean) => {
        this.calendarOptions.selectable = selectable;
      });

    // to reset date selection which is selected on date click on calendar
    this.subscription = this.broadcaster
      .on('selectUnselectDate')
      .subscribe(
        (dates: { startDate: any; endDate: DateInput | undefined }) => {
          if (dates.startDate) {
            setTimeout(() => {
              this.calendarComponent
                ?.getApi()
                .select(dates.startDate, dates.endDate);
            }, 0);
          } else {
            this.calendarComponent.getApi().unselect();
          }
        }
      );

    this.multiSelectSubscription = this.broadcaster
      .on('removeSharableLinkTimeSlot')
      .subscribe((timeSlot: any) => {
        const filt = this.mySelectedDateEvents.filter((res: any) => {
          return res.start != timeSlot[0].start;
        });
        this.mySelectedDateEvents = filt;
        this.calendarOptions.events = this.oldEvents
          ? [...this.oldEvents].concat(filt)
          : filt;
      });

    this.initSharableLinkSubscription = this.broadcaster
      .on('addSharableLinkTimeSlot')
      .subscribe((timeSlots: any) => {
        const events = [];
        const startDateArr: any = [];
        for (const timeslot of timeSlots) {
          const startDate = timeslot.startDate;
          if (!startDateArr.includes(startDate)) {
            events.push({
              start: startDate,
              end: timeslot.endDate,
              display: 'background',
              overlap: false,
              color: '#83b4f0',
            });
            startDateArr.push(startDate);
          }
        }

        this.mySelectedDateEvents = events;
        this.calendarOptions.events = this.oldEvents
          ? [...this.oldEvents].concat(events)
          : events;
      });

    this.subscription = this.broadcaster
      .on('timeSLotInterval')
      .subscribe((minutes: number) => {
        this.calendarOptions.slotLabelInterval = minutes;
        this.calendarOptions.slotDuration = `00:${String(minutes)}:00`;
      });
  }

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
                event_class: el.calendar.calendarType == CalendarType.GoogleCalendar ? 'google-event' : 'office365-event',
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

  syncCalendars() {
    console.log('sync')
    this.calendarService.syncCalendars()
      .pipe(first())
      .subscribe({
        next: () => {
          console.log('calendar synced!')
        },
        error: (e) => {
          console.log(e);
        }
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
}
