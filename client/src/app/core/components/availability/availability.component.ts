import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {CalendarAvailability} from '../../interfaces/calendar/availability.calendar.interface';
import {AvailabilityService} from '../../services/calendar/availability.service';
import { CommonService } from '../../services/common.service';
import { first } from 'rxjs';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
var moment = require('moment-timezone');

@Component({
  selector: 'app-availability',
  templateUrl: './availability.component.html',
  styleUrls: ['./availability.component.scss']
})
export class AvailabilityComponent implements OnInit {

  availability: CalendarAvailability | null = null;
  _availability: CalendarAvailability = {
    from: "09:00am",
    to: "05:00pm",
    timezone: this.commonService.localTimezone,
    clockType: ClockType.NORMAL.valueOf(),
    sunday: false,
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: false
  }
  error: any | null = null;

  availableTimezones = moment.tz.names().map((zone: string) => {
    const data = zone.split('/')
    return {
      label: data.map((text: string) => text.trim().charAt(0).toUpperCase() + text.replaceAll('_', ' ').slice(1)).join(' / '),
      value: zone
    }
  });

  private _isFromAm = true
  private _isToAm = false

  pauseUpdate = false;

  constructor(
    private calendarAvailabilityService: AvailabilityService,
    private changeDetectorRef: ChangeDetectorRef,
    private commonService: CommonService
  ) {}

  ngOnInit(): void {
    this.fetchAvailability();
  }

  get selectedTimezone() {
    return this.tempAvailability.timezone;
  }

  get currentAvailability() {
    return this.availability;
  }

  set currentAvailability(value) {
    this.availability = value;
    if (value != null) {
      this.tempAvailability = value;
    }
    this.changeDetectorRef.detectChanges();
  }

  get tempAvailability() {
    return this._availability;
  }

  set tempAvailability(value) {
    this._availability = value;
  }

  get fromText() {
    const from = this.tempAvailability.from
    if (from.endsWith("am") || from.endsWith("pm")) {
      return from.slice(0, from.length - 2);
    }
    return from;
  }

  set fromText(value) {
    const suffix = this.tempAvailability.clockType == ClockType.NORMAL ? (this.isFromAM) ? 'am' : 'pm' : '';
    this.tempAvailability.from = `${value}${suffix}`;
    if (!this.pauseUpdate) this.updateAccessibility();
  }

  get toText() {
    const to = this.tempAvailability.to
    if (to.endsWith("am") || to.endsWith("pm")) {
      return to.slice(0, to.length - 2);
    }
    return to;
  }

  set toText(value) {
    const suffix = this.tempAvailability.clockType == ClockType.NORMAL ? (this.isToAM) ? 'am' : 'pm' : '';
    this.tempAvailability.to = `${value}${suffix}`;
    if (!this.pauseUpdate) this.updateAccessibility();
  }

  get isFromAM() {
    return this._isFromAm;
  }

  set isFromAM(value) {
    this._isFromAm = value
    if (this.meridian) {
      this.tempAvailability.from = `${this.fromText}${value ? 'am' : 'pm'}`;
      this.updateAccessibility();
    }
  }

  get isToAM() {
    return this._isToAm;
  }

  set isToAM(value) {
    this._isFromAm = value
    if (this.meridian) {
      this.tempAvailability.to = `${this.toText}${value ? 'am' : 'pm'}`;
      this.updateAccessibility();
    }
  }

  fetchAvailability() {
    this.calendarAvailabilityService.fetch()
      .pipe(first())
      .subscribe({
        next: (value: CalendarAvailability | null) => {
          this.currentAvailability = value
        },
        error: (error) => {
          this.error = error;
        }
      });
  }

  updateAccessibility() {
    const data: CalendarAvailability = this.tempAvailability;
    const observable = this.currentAvailability == null
      ? this.calendarAvailabilityService.create(data)
      : this.calendarAvailabilityService.update(data)

    observable.pipe(first())
      .subscribe({
        next: (value: CalendarAvailability) => {
          this.currentAvailability = value
        },
        error: (error) => {
          this.error = error;
        }
      })
  }

  onTimezoneSelected(timezone: { value: string, label: string }) {
    if (this.tempAvailability.timezone === timezone.value) {
      return;
    }
    this.tempAvailability.timezone = timezone.value;
    this.updateAccessibility();
  }

  onClockTypeChanged(type: ClockType) {
    if (this.tempAvailability.clockType === type) {
      return;
    }

    this.tempAvailability.clockType = type;
    this.pauseUpdate = true;
    this.fromText = this.parseTime(this.tempAvailability.from, this.meridian, this.isFromAM);
    this.toText = this.parseTime(this.tempAvailability.to, this.meridian, this.isToAM);
    this.updateAccessibility();
    this.pauseUpdate = false;
  }

  parseTime(time: string, inMeridian: boolean, isAM: boolean) {
    const hours = time.slice(0, 2);
    const mins = time.slice(3, 5);

    return `${this.parseHours(hours, inMeridian, isAM)}:${mins}`;
  }

  parseHours(hours: string, inMeridian: boolean, isAM: boolean) {
    let hoursInt = parseInt(hours);
    if (inMeridian) {
      hoursInt = (hoursInt > 12) ? hoursInt - 12 : hoursInt;
    } else {
      hoursInt = (isAM) ? hoursInt : hoursInt + 12;
    }
    return `${hoursInt}`.padStart(2, '0');
  }

  toggleDaySelection(day: Day) {
    switch (day) {
      case Day.SUN:
        this.tempAvailability.sunday = !this.tempAvailability.sunday
        break;
      case Day.MON:
        this.tempAvailability.monday = !this.tempAvailability.monday
        break;
      case Day.TUE:
        this.tempAvailability.tuesday = !this.tempAvailability.tuesday
        break;
      case Day.WED:
        this.tempAvailability.wednesday = !this.tempAvailability.wednesday
        break;
      case Day.THU:
        this.tempAvailability.thursday = !this.tempAvailability.thursday
        break;
      case Day.FRI:
        this.tempAvailability.friday = !this.tempAvailability.friday
        break;
      case Day.SAT:
        this.tempAvailability.saturday = !this.tempAvailability.saturday
        break;
    }
    this.updateAccessibility();
  }

  get meridian() {
    return this.tempAvailability.clockType !== ClockType.MILITARY.valueOf();
  }

  get Day(): typeof Day {
    return Day;
  }

  get ClockType(): typeof ClockType {
    return ClockType;
  }
}

enum ClockType {
  NORMAL = "12h",
  MILITARY = "24h"
}

enum Day {
  SUN = "Sun",
  MON = "Mon",
  TUE = "Tue",
  WED = "Wed",
  THU = "Thu",
  FRI = "Fri",
  SAT = "Sat"
}
