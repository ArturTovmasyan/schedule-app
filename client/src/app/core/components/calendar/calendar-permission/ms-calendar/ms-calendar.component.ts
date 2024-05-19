import {Component, OnInit} from '@angular/core';
import {AuthService} from "../../../../services/auth/auth.service";
import {CalendarPermissionService} from "../../../../services/calendar/permission.service";
import {ActivatedRoute, Router} from "@angular/router";
import {first} from "rxjs/operators";

@Component({
  selector: 'app-ms-calendar',
  templateUrl: './ms-calendar.component.html',
  styleUrls: ['./ms-calendar.component.scss']
})
export class MsCalendarComponent implements OnInit {

  constructor(private authService: AuthService,
              private calendarPermissionService: CalendarPermissionService,
              private route: ActivatedRoute,
              private router: Router) {
  }

  ngOnInit(): void {
    this.route.queryParams
      .subscribe(params => {
          if (params['code']) {
            this.calendarPermissionService.msCallback(params['code'])
              .pipe(first())
              .subscribe({
                next: () => {
                  const route = localStorage.getItem('calendar-redirect') ?? '/onboarding/calendar';
                  this.router.navigate([route]);
                },
                error: () => {
                  this.router.navigate(['/404'])
                }
              });
          }
        }
      );
  }
}
