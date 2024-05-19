import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import * as moment from 'moment';
import { PublicCalendarService } from '../calendar.service';
import interactionPlugin from "@fullcalendar/interaction";
import bootstrapPlugin from "@fullcalendar/bootstrap"


export class PublicSidebarCalendarComponent  {

  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin, interactionPlugin, bootstrapPlugin],
    height: 'auto',
    nowIndicator: true,
    direction: 'ltr',
    themeSystem: 'bootstrap',
    dayHeaders: true,
    editable: true,
    eventOrderStrict: true,
    stickyHeaderDates: true,
    windowResizeDelay: 100,
    dragRevertDuration: 500,
    handleWindowResize: false,
    expandRows: false,
    showNonCurrentDates: true,
    lazyFetching: false,
    firstDay: 1,
    eventDisplay: 'block',
    eventStartEditable: false,
    slotMinWidth: 1,
    eventDurationEditable: false,
    dayHeaderFormat: { weekday: 'short' },
    windowResize: (view) => {
      view.view.calendar.updateSize();
    },
    eventClick: function (eventInfo: any) {
      const calendar = eventInfo.view.calendar;
      calendar.updateSize();
    },
    eventDidMount: function (info) {
      if (info.el.closest('.fc-daygrid-day')) {
        const hh = moment(info.event.start).isSame(new Date(), 'isoWeek');
        info.el.closest('.fc-daygrid-day')?.classList.add('fc-event-div');
        if (hh) {
          info.el.closest('.fc-daygrid-day')?.classList.add('current-week');
        } else {
          info.el.closest('.fc-daygrid-day')?.classList.add('na-week');
        }
        if (info.event._def.groupId == 'defaultSelectedSlot') {
          info.el.closest('.fc-daygrid-day')?.classList.add('default-selected-date');
        }
      }
    },
    selectable: true,
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
      right: ''
    },
    eventClassNames: function (args) {
      return 'evento';
    },
    select: (info: any) => {
      this.changeWeek(info.start);
    },
  }

  constructor( public calendarService: PublicCalendarService) { }

  changeWeek(date: any) {
    this.calendarService.selectedWeek.next(date);
  }

}
