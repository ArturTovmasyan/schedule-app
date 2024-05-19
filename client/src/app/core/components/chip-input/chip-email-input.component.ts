import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'app-chip-email-input',
  templateUrl: './chip-email-input.component.html',
  styleUrls: ['./chip-email-input.component.scss']
})
export class ChipEmailInputComponent {

  @Output() emailUpdateEvent = new EventEmitter<string[]>();
  @ViewChild('emailInput')
  emailInput!: ElementRef;
  
  emails: string[] = []

  add() {
    const email = this.emailInput.nativeElement.value;
    this.emails.push(email);
    this.emailInput.nativeElement.value = "";

    this.emailUpdateEvent.emit(this.emails);
  }

  remove(index: number) {
    this.emails.splice(index, 1);
    this.emailUpdateEvent.emit(this.emails);
  }
}