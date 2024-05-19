import { Component, OnDestroy, OnInit } from '@angular/core';
import { BroadcasterService } from "../../../shared/services";
import { BehaviorSubject, Subscription } from "rxjs";
import { CommonService } from '../../services/common.service';
import { ActivatedRoute, NavigationEnd, Router,Event as NavigationEvent } from '@angular/router';

@Component({
  selector: 'app-availability',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit, OnDestroy {
  subscription: Subscription | null = null;
  calendarFullSize: boolean = false;
  timezone = "";

  constructor(
    private readonly commonService: CommonService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {
    this.timezone = `${this.commonService.formattedLocalTimezone}`;
  }

  ngOnInit(): void {
    this.subscription = this.route.url.subscribe(() => {
      this.calendarFullSize = this.route.snapshot.firstChild == null;
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  close() {
    this.router.navigate(['/calendar']);
  }
}
