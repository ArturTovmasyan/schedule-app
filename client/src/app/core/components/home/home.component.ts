import {Component, OnInit} from '@angular/core';
import {BroadcasterService} from "../../../shared/services";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit
{
  public fullName = '';

  constructor(private broadcaster: BroadcasterService) {

    const userData = localStorage.getItem('currentUser');

    if (userData) {
      const user = JSON.parse(userData);
      this.fullName = user.first
    }
  }

  ngOnInit(): void {
    this.broadcaster.broadcast('logged', true);
  }
}
