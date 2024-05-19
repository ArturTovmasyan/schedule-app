import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Calendar, CalendarOptions, FullCalendarComponent } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import * as moment from 'moment';
import { Subject } from 'rxjs';
import { Location } from 'src/app/core/interfaces/calendar/location.interface';
import { AVAILABILITY_EVENT_CLASS } from 'src/app/core/interfaces/constant/calendar.constant';
import { BroadcasterService } from 'src/app/shared/services';
import { MeetViaEnum } from '../../calendar/enums/sharable-links.enum';
import { SelectedTimeSlotData } from '../interfaces/selected-timeslot.interface';
import { PublicCalendarService } from '../public.service';


@Component({
  selector: 'app-group-availability',
  templateUrl: './group-availability.component.html',
  styleUrls: ['./group-availability.component.scss']
})
export class GroupAvailabilityComponent implements OnInit, OnDestroy {

  errorMessage = null;
  componentData: SelectedTimeSlotData = {
    isTimeslotSelected: false,
    selectedTimeSlot: null,
    selectedTimeSlotId: null
  };
  readonly MeetViaEnum = MeetViaEnum;
  destroy$ = new Subject();
  @ViewChild("calendar") calendar!: FullCalendarComponent;
  calendarApi!: Calendar;
  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin],
    height: 'auto',
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
        const hh = moment(info.event.start).isSame(new Date(), 'isoWeek');
        info.el.closest('.fc-daygrid-day')?.classList.add('fc-event-div');
        if (hh) {
          info.el.closest('.fc-daygrid-day')?.classList.add('current-week');
        } else {
          info.el.closest('.fc-daygrid-day')?.classList.add('na-week');
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
  attendees: any;
  location: Location | undefined;
  form!: FormGroup;
  selectedSlot: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private calendarService: PublicCalendarService,
    private broadcaster: BroadcasterService
  ) {
    this.linkId = route.snapshot.params['id'];
    this.initForm();
  }

  get f() {
    return this.form.controls;
  }

  get timezone() {
    return this.calendarService.timezone;
  }

  ngOnInit(): void {
    this.calendarService.getDetails(this.linkId)
      .subscribe((data: any) => {
        if (data?.slots) {
          // load available timeslots on calendar
          const datas = [];
          for (const date of data.slots) {
            if (date.choosedByEmail) {
              datas.push({
                id: date.id,
                groupId: 'notAvailableSlot',
                start: date.startDate,
                end: date.endDate
              });
            } else {
              datas.push({
                id: date.id,
                groupId: 'availableSlot',
                start: date.startDate,
                end: date.endDate,
                className: AVAILABILITY_EVENT_CLASS
              });
            }
          }
          this.broadcaster.broadcast('loadAvailableTimeslots', datas);
          // location
          this.location = this.calendarService.getLocations().find(res => res.value == data['meetVia']);
          if (data['meetVia'] == MeetViaEnum.OutboundCall) {
            this.addValidation('phoneNumber');
          }

          this.calendarOptions.events = datas;
        }
        if (data?.attendees?.length > 0) {
          this.attendees = data.attendees;
        }
      });

      this.onTimeSlotSelected();
  }

  ngAfterViewChecked() {
    this.calendarApi = this.calendar.getApi();
  }

  onTimeSlotSelected() {
    this.destroy$ = this.broadcaster.on('timeSlotSelected')
      .subscribe((data: any) => {
        this.componentData = data;
      });
  }

  initForm() {
    this.form = this.formBuilder.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      note: [''],
      phoneNumber: ['']
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

    const timeSlotId = this.componentData.selectedTimeSlotId as string;

    this.calendarService.submitSelectedSlotInfo(timeSlotId, formData)
    .subscribe({
      next: (res) => {
        const events = this.calendarOptions.events as any;
        const datas = [];
        let selectedDate = null;
        this.broadcaster.broadcast('loadAvailableTimeslots', []);
        for (const date of events) {
          if (date.id == timeSlotId) {
            datas.push({
              id: date.id,
              groupId: 'notAvailableSlot',
              start: date.start,
              end: date.end
            });
            selectedDate = date.start;
          } else {
            datas.push({
              id: date.id,
              groupId: date.groupId,
              start: date.start,
              end: date.end,
              className: date.className
            });
          }

        }
        this.broadcaster.broadcast('loadAvailableTimeslots', [...datas]);
        this.calendarOptions.events = datas;
        this.componentData.isTimeslotSelected = false;
        this.componentData.selectedTimeSlot = null;
        this.componentData.selectedTimeSlotId = null;
        if (selectedDate) this.calendarApi.gotoDate(selectedDate);
      },
      error: (err) => {
        this.errorMessage = err.error.message;
      }
    })
  }

  addValidation(controlName: string) {
    this.form.controls[controlName].setValidators(Validators.required);
    this.form.controls[controlName].updateValueAndValidity();
  }

  removeValidation(controlName: string) {
    this.form.controls[controlName].clearValidators();
    this.form.controls[controlName].updateValueAndValidity();
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

}
