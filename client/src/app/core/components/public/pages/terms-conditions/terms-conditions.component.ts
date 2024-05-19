import { Component, OnInit } from '@angular/core';
import { BroadcasterService } from 'src/app/shared/services';

@Component({
  selector: 'app-terms-conditions',
  templateUrl: './terms-conditions.component.html',
  styleUrls: ['./terms-conditions.component.scss']
})
export class TermsConditionsComponent implements OnInit {

  constructor(
    private broadcaster: BroadcasterService
  ) { }

  ngOnInit(): void {
    this.broadcaster.broadcast('isLandingPage', false);
  }

}
