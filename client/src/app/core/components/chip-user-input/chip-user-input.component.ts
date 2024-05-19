import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import {ValidationService} from "../../../shared/services";
import {FormControl} from "@angular/forms";

@Component({
  selector: 'app-chip-user-input',
  templateUrl: './chip-user-input.component.html',
  styleUrls: ['./chip-user-input.component.scss']
})
export class ChipUserInputComponent {

  @Input() users: UserData[] = [];
  @Input() contacts: UserData[] = [];
  @Input() contactsOnly = false;
  @Output() userUpdateEvent = new EventEmitter<UserData[]>();
  @Output() userAddEvent = new EventEmitter<UserData>();
  @Output() userRemoveEvent = new EventEmitter<UserData>();
  @Output() hasError = new EventEmitter<boolean>();
  @ViewChild('emailInput')
  emailInput!: ElementRef;
  error: boolean = false;
  errorMessage: string = '';

  email: string = '';

  add() {
    const email = this.emailInput.nativeElement.value;
    if(email === '') return;

    let emailControl = new FormControl(email);
    let invalidEmail = ValidationService.emailValidator(emailControl)?.invalidEmailAddress;

    let invalidContact = this.contactsOnly && !this.contacts.find(c => c.email === email);
    
    if (invalidEmail || invalidContact) {
      this.error = true;
      this.errorMessage = invalidEmail ? 'Invalid email' : 'Provided email is not in your contacts.';
      this.hasError.emit(true);
      return;
    }

    this.error = false;
    this.addUser({
      email: email,
      avatar: '',
      removable: true
    })
  }

  addUser(user: UserData) {
    this.userAddEvent.emit(user);
    this.users.push(user);
    this.emailInput.nativeElement.value = "";
    this.userUpdateEvent.emit(this.users);
  }

  remove(index: number) {
    this.userRemoveEvent.emit(this.users[index]);
    this.users.splice(index, 1);
    this.userUpdateEvent.emit(this.users);
  }

  onChange() {
    this.error = false;
    const selectedCotact = this.contacts.find((contact) => {
      return contact.email === this.email;
    });
    if(selectedCotact) {
      this.addUser(selectedCotact);
    }
  }

  updateError() {
    const val = this.emailInput.nativeElement.value

    if (!val) {
      this.error = false;
      this.hasError.emit(false);
    }
  }
}

export interface UserData {
  id?: string | undefined;
  name?: string | undefined;
  email: string;
  avatar: string | null;
  removable: boolean;
}
