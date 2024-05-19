import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CalendarOptions } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import * as moment from 'moment';
import { Subject } from 'rxjs';
import { Location } from 'src/app/core/interfaces/calendar/location.interface';
import { AVAILABILITY_EVENT_CLASS } from 'src/app/core/interfaces/constant/calendar.constant';
import { BroadcasterService } from 'src/app/shared/services';
import { MeetViaEnum } from '../../calendar/enums/sharable-links.enum';
import { PublicCalendarService } from '../public.service';

type ComponentData = {
  isTimeslotSelected: boolean,
  selectedTimeSlot: any,
  oldTimeslot: any,
  timezone: any
};

@Component({
  selector: 'app-reschedule-meeting',
  templateUrl: './reschedule-meeting.component.html',
  styleUrls: ['./reschedule-meeting.component.scss']
})
export class RescheduleMeetingComponent implements OnInit, OnDestroy {

  componentData: ComponentData = {
    isTimeslotSelected: false,
    selectedTimeSlot: null,
    oldTimeslot: null,
    timezone: ''
  };
  readonly MeetViaEnum = MeetViaEnum;
  destroy$ = new Subject();
  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin],
    height: '400px',
    nowIndicator: true,
    direction: 'ltr',
    themeSystem: 'bootstrap',
    dayHeaders: true,
    editable: false,
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
    dayHeaderFormat: { weekday: 'narrow' },
    windowResize: (view) => {
      view.view.calendar.updateSize();
    },
    eventClick: function (eventInfo: any) {
      const calendar = eventInfo.view.calendar;
      calendar.updateSize();
    },
    eventDidMount: function (info) {
      if (info.el.closest('.fc-daygrid-day')) {
        const sameWeek = moment(info.event.start).isSame(new Date(), 'isoWeek');
        info.el.closest('.fc-daygrid-day')?.classList.add('fc-event-div');
        if (sameWeek) {
          info.el.closest('.fc-daygrid-day')?.classList.add('current-week');
        } else {
          info.el.closest('.fc-daygrid-day')?.classList.add('na-week');
        }
        console.log('llllll', info.event._def.groupId);
        if (info.event._def.groupId == 'defaultSelectedSlot') {
          console.log('lllllkkkkk', info.event._def.groupId);
          console.log('ff', info.el.closest('.fc-daygrid-day')?.classList);
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
    views: {
      month: {
        columnHeaderFormat: 'dd'
      },
    },
    titleFormat: {
      month: 'short', day: 'numeric'
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
      return 'eventooo';
    },
    select: (info) => {
      this.changeWeek(info.start);
    },
    selectOverlap: function (info) {
      return true;
    }
  }
  linkId: string;
  scheduledId: string;
  attendees: any;
  location: Location | undefined;
  form!: FormGroup;
  selectedSlot: any;


  constructor(
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private calendarService: PublicCalendarService,
    private broadcaster: BroadcasterService
  ) {
    this.linkId = route.snapshot.parent?.params['id'];
    this.scheduledId = route.snapshot.params['scheduledId'];
    this.initForm();
  }

  get f() {
    return this.form.controls;
  }

  ngOnInit(): void {
    this.calendarService.getDetails(this.linkId)
      .subscribe((data: any) => {
        console.log('data12345', data);
        if (data?.slots) {
          // load available timeslots on calendar
          const datas = [];
          for (const date of data.slots) {
            datas.push({
              groupId: 'availableSlot',
              start: date.startDate,
              end: date.endDate,
              className: AVAILABILITY_EVENT_CLASS
            });
          }
          this.broadcaster.broadcast('loadAvailableTimeslots', datas);
          // location
          this.location = this.calendarService.getLocations().find(res => res.value == data['meetVia']);
          // TODO: already scheduled date from API
          const oldSlot = {
            groupId: 'defaultSelectedSlot',
            start: '2023-01-24T09:45:00.000Z',
            end: '2023-01-24T10:15:00.000Z'
          };
          datas.push(oldSlot);
          const timezone = new Date().toString().match(/([A-Z]+[\+-][0-9]+.*)/)?.[1];
          this.componentData.oldTimeslot = oldSlot
          this.componentData.timezone = timezone;
          // upto here

          this.calendarOptions.events = datas;
        }

        if (data?.attendees?.length > 0) {
          this.attendees = data.attendees;
        }
      });

      this.onTimeSlotSelected();
  }

  onTimeSlotSelected() {
    this.destroy$ = this.broadcaster.on('timeSlotSelected')
      .subscribe((data: any) => {
        this.componentData = data;
      });
  }

  initForm() {
    this.form = this.formBuilder.group({
      notes: ['', [Validators.required]]
    }, { updateOn: 'blur' });
  }

  changeWeek(date:any) {
    this.calendarService.selectedWeek.next(date);
  }

  submit() {
    if (!this.form.valid){
      this.form.markAllAsTouched();
      return;
    }
    const formData = this.form.value;
    formData['selectedTimeslot'] = this.componentData.selectedTimeSlot;
    return;
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

}
