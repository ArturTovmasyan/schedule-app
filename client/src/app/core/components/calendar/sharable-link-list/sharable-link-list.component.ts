import { Component, OnInit } from '@angular/core';
import {BroadcasterService} from "../../../../shared/services";

@Component({
  selector: 'app-sharable-link-list',
  templateUrl: './sharable-link-list.component.html',
  styleUrls: ['./sharable-link-list.component.scss']
})
export class SharableLinkListComponent implements OnInit {

  constructor(private readonly broadcaster: BroadcasterService) { }

  ngOnInit(): void {
  }

  close() {
    this.broadcaster.broadcast('calendar_full_size', true);
  }
}
