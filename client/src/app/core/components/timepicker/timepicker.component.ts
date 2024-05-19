import {ViewportScroller} from '@angular/common';
import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import * as moment from 'moment';

@Component({
  selector: 'app-timepicker',
  templateUrl: './timepicker.component.html',
  styleUrls: ['./timepicker.component.scss']
})
export class TimepickerComponent implements OnInit, OnChanges {

  @Input() meridian = false;
  @Input() time: string = moment().format('hh:mm')
  @Output() timeChange = new EventEmitter<string>();
  @Input() inAM = true
  @Output() inAMChange = new EventEmitter<boolean>();

  showDropdown = false;

  hour = "";
  minute = "";

  invalidTime = false;
  timer: any = null;

  constructor(private scroller: ViewportScroller) {
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {

    this.time = changes['time']?.currentValue ?? this.time;
    this.meridian = changes['meridian']?.currentValue ?? this.meridian;
    this.inAM = changes['inAM']?.currentValue ?? this.inAM;

    const data = this.time.split(':');
    this.hour = data[0];
    this.minute = data[1];
  }

  get minHour() {
    return this.meridian ? 1 : 0;
  }

  get maxHour() {
    return this.meridian ? 12 : 23;
  }

  get timeSlots() {
    const startIndex = 0;
    const endIndex = this.maxHour;
    const slots: string[] = [];
    for (let i = startIndex; i < endIndex; i++) {
      slots.push(`${i}:00`.padStart(5, '0'));
    }
    return slots;
  }

  isSelected(slot: string) {
    return slot == this.time;
  }

  selectSlot(slot: string) {
    this.time = slot;
    this.timeChange.emit(this.time);
    this.toggleDropdown();
  }

  generateSlotId(slot: string) {
    if (slot == "08:00") return "target";
    return slot.replace(':', '-');
  }

  timeUpdated() {
    this.hour = this.hour.padStart(2, '0');
    this.minute = this.minute.padStart(2, '0');
    this.time = (`${this.hour}:${this.minute}`);
    this.timeChange.emit(this.time);
  }

  hourUpdated(event: any) {
    if(this.timer) clearTimeout(this.timer);

    const text = event.target.value;
    this.invalidTime = text.length > 2 || text.length < 1 || parseInt(text) > this.maxHour || parseInt(text) < this.minHour;
    if(!this.invalidTime) {
      this.hour = text;
      this.timer = setTimeout(() => {
        this.timeUpdated();
      }, 1000);
    }
  }

  minuteUpdated(event: any) {
    const text = event.target.value;
    this.invalidTime = text.length > 2 || text.length < 1 || parseInt(text) > 59 || parseInt(text) < 0;
    if(!this.invalidTime) {
      this.minute = text;
      this.timer = setTimeout(() => {
        this.timeUpdated();
      }, 1000);
    }
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown
    if (this.showDropdown) {
      setTimeout(() => {
        this.scroller.scrollToAnchor(this.generateSlotId(this.time));
      }, 1000)
    }
  }

  inAMUpdated(flag: boolean) {
    this.inAM = flag;
    this.inAMChange.emit(flag);
  }
}
