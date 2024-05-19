import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {

  fullName: string = '';

  constructor() {

    let userData = localStorage.getItem('currentUser');

    if (userData) {
      let user = JSON.parse(userData);
      this.fullName = user.first
    }
  }
}
