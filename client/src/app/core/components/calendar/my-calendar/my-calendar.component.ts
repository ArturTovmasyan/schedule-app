import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {CalendarOptions, FullCalendarComponent} from "@fullcalendar/angular";
import {first} from "rxjs/operators";
import {CalendarService} from "../../../services/calendar/calendar.service";
import DateConverter from "../../helpers/date.converter";

@Component({
  selector: 'app-my-calendar',
  templateUrl: './my-calendar.component.html',
  styleUrls: ['./my-calendar.component.scss']
})
export class MyCalendarComponent implements OnInit, AfterViewInit {
  events: any = [];
  error: any = null;
  calendarApi: any;

  @ViewChild('calendar')
  calendarComponent!: FullCalendarComponent;

  constructor(private calendarService: CalendarService) {}

  ngOnInit(): void {
    this.fetchMyEvents();
  }

  ngAfterViewInit(): void {
    debugger;
    this.calendarApi = this.calendarComponent.getApi();
  }

  fetchMyEvents() {

    debugger;
    this.calendarApi.next();
    this.calendarApi.preview();

    this.calendarService.fetchEvents()
      .pipe(first())
      .subscribe({
        next: (events: any) => {
          const data: any[] = [];
          if (events.length > 0) {
            events.forEach((el: any) => {
              debugger;
              data.push({
                start: DateConverter.convertUTCDateToLocalDate(el.start),
                end: DateConverter.convertUTCDateToLocalDate(el.end),
                title: el.title,
                description: el.description
              })
            })

            this.calendarOptions.events = data;
          }
        },
        error: (error) => {
          this.error = error;
        }
      });
  }

  calendarOptions: CalendarOptions = {
    initialView: 'timeGridWeek',
    dayHeaderFormat: {weekday: 'short', day: 'numeric', omitCommas: true},
    direction: 'ltr',
    themeSystem: 'bootstrap',
    selectable: true,
    allDaySlot: false,
    droppable: true,
    eventContent: this.eventContent.bind(this),
    dateClick: this.handleDateClick.bind(this),
    eventTextColor: 'black',
    eventBackgroundColor: '#E9F6FD',
    eventOrderStrict: true,
    eventTimeFormat: {
      hour: 'numeric',
      minute: '2-digit',
      meridiem: 'short'
    },
    titleFormat: {
      year: 'numeric', month: 'long', day: 'numeric'
    },
    headerToolbar: {
      left: '',
      center: 'prev,title,next',
      right: 'today'
    },
    events: [
      { title: 'event 1', start: '2022-10-03T03:45:00', end: '2022-10-03T04:45:00', description: 'Event 1 description' },
      { title: 'event 2', start: '2022-10-04T07:45:00', end: '2022-10-04T08:45:00', description: 'Event 2 description' },
      { title: 'event 3', start: '2022-10-05T02:45:00', end: '2022-10-05T05:45:00', description: 'Event 3 description' },
      { title: 'event 4', start: '2022-10-06T10:45:00', end: '2022-10-06T12:45:00', description: 'Event 4 description' },
    ],
  };

  eventContent(arg: any) {
      let divEl = document.createElement('div');
      // let description = arg.event._def.extendedProps['description'];
      let title = arg.event.title;
      let time = arg.timeText;

    divEl.style.height = '200px';
    divEl.style.borderLeft = '10px solid #4AA3E1';
    divEl.innerHTML ='<strong>' + title + '</strong><br/><span style="color: #4AA3E1">'+time+'</span>';//<br/><span>'+description+'</span>'

      // if (description.length > 6) {
      // 10px solid #4AA3E1
      //   $('div.fc-timegrid-event-harness').css('width', '150');
      // }

      // let arrayOfDomNodes = [divEl];
      return { html: divEl.innerHTML };
  }

  handleDateClick(arg: { dateStr: string; }) {
    // alert('date click! ' + arg.dateStr)
  }
}
