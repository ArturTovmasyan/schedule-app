import {ViewportScroller} from '@angular/common';
import {Component, EventEmitter, Input, Output} from '@angular/core';
import * as moment from 'moment';

@Component({
  selector: 'app-timepicker',
  templateUrl: './timepicker.component.html',
  styleUrls: ['./timepicker.component.scss']
})
export class TimepickerComponent {

  @Input() meridian = false;
  @Input() time: string = moment().format('hh:mm')
  @Output() timeChange = new EventEmitter<string>();
  @Input() inAM = true
  @Output() inAMChange = new EventEmitter<boolean>();

  showDropdown = false;

  constructor(private scroller: ViewportScroller) {
  }

  get timeSlots() {
    const startIndex = 0;
    const endIndex = this.meridian ? 12 : 24;
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

  timeUpdated(event: any) {
    const text = this.formatTime(event.target.innerText);
    event.target.innerText = text;
    this.placeCaretAtEnd(event.target);

    if (text.length == 5) {
      this.timeChange.emit(text);
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

  formatTime(text: string) {
    let cleanText = text.replace(/\D/g, "");
    const length = cleanText.length;

    if (length > 4) {
      cleanText = cleanText.slice(0, 4);
    }

    if (length == 2) {
      cleanText = this.formatHours(cleanText)
    } else if (length > 2) {
      cleanText = `${this.formatHours(cleanText.slice(0, 2))}${this.formatMins(cleanText.slice(2, cleanText.length))}`
    }

    return cleanText;
  }

  formatMins(text: string) {
    if (parseInt(text) > 59) {
      text = `00`;
    }
    return text;
  }

  formatHours(text: string) {
    const upperHourLimit = this.meridian ? 12 : 23;
    if (parseInt(text) > upperHourLimit) {
      text = `0${text.slice(0, 1)}:${text.slice(1, 2)}`;
    } else {
      text = `${text}:`
    }
    return text;
  }

  placeCaretAtEnd(el: any) {
    el.focus();
    if (typeof window.getSelection != "undefined"
      && typeof document.createRange != "undefined") {
      const range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(false);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  }
}
