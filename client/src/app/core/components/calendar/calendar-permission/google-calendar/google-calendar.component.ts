import {Component, OnInit} from '@angular/core';
import {AuthService} from "../../../../services/auth/auth.service";
import {first} from "rxjs/operators";
import {ActivatedRoute, Router} from "@angular/router";
import {CalendarPermissionService} from "../../../../services/calendar/permission.service";

@Component({
  selector: 'app-google-calendars',
  templateUrl: './google-calendar.component.html',
  styleUrls: ['./google-calendar.component.scss']
})
export class GoogleCalendarComponent implements OnInit {

  constructor(private authService: AuthService,
              private calendarPermissionService: CalendarPermissionService,
              private route: ActivatedRoute,
              private router: Router) {
  }

  ngOnInit(): void {
    this.route.queryParams
      .subscribe(params => {
          if (params['code']) {
            this.calendarPermissionService.googleCallback(params['code'])
              .pipe(first())
              .subscribe({
                next: () => {
                  const route = localStorage.getItem('calendar-redirect') ?? '/onboarding/calendar';
                  this.router.navigate([route]);
                },
                error: () => {
                  this.router.navigate(['/404']);
                }
              });
          }
        }
      );
  }
}
