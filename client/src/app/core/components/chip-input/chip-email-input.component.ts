import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import {ValidationService} from "../../../shared/services";
import {FormControl} from "@angular/forms";

@Component({
  selector: 'app-chip-email-input',
  templateUrl: './chip-email-input.component.html',
  styleUrls: ['./chip-email-input.component.scss']
})
export class ChipEmailInputComponent {

  @Input() emails: string[] = [];
  @Output() emailUpdateEvent = new EventEmitter<string[]>();
  @Output() hasError = new EventEmitter<boolean>();
  @ViewChild('emailInput')
  emailInput!: ElementRef;
  error: boolean = false;

  add() {
    const email = this.emailInput.nativeElement.value;
    let emailControl = new FormControl(email);
    let invalidEmail = ValidationService.emailValidator(emailControl)?.invalidEmailAddress;

    if (invalidEmail) {
      this.error = true;
      this.hasError.emit(true);
      return;
    }

    this.error = false;
    this.emails.push(email);
    this.emailInput.nativeElement.value = "";
    this.emailUpdateEvent.emit(this.emails);
  }

  remove(index: number) {
    this.emails.splice(index, 1);
    this.emailUpdateEvent.emit(this.emails);
  }

  updateError(ev:any) {
    const val = this.emailInput.nativeElement.value
    if (ev.key == ',' || ev.key == " ") {
      this.emailInput.nativeElement.value = val.trim().replace(/[, ]+$/, '');
      this.add();
      return;
    }

    if (!val) {
      this.error = false;
      this.hasError.emit(false);
    }
  }
}
