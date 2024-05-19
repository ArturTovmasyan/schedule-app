import {Component, OnInit} from '@angular/core';
import {BroadcasterService} from "../../../shared/services";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  constructor(private broadcaster: BroadcasterService) {
  }

  ngOnInit(): void {
    this.broadcaster.broadcast('logged', true);
  }
}
