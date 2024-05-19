import { Component, OnInit } from '@angular/core';
import { BroadcasterService } from 'src/app/shared/services';

@Component({
  selector: 'app-privacy-policy',
  templateUrl: './privacy-policy.component.html',
  styleUrls: ['./privacy-policy.component.scss']
})
export class PrivacyPolicyComponent implements OnInit {

  constructor(
    private broadcaster: BroadcasterService
  ) { }

  ngOnInit(): void {
    this.broadcaster.broadcast('isLandingPage', false);
  }

}
