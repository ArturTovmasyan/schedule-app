import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';
import { CalendarAccessibility } from '../../interfaces/calendar/accessibility.calendar.inteface';
import { AccessibilityService } from '../../services/calendar/accessibility.service';

enum AccessibilityType {
  PUBLIC = "public",
  DOMAIN = "domain",
  REQUEST = "request"
}

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.scss']
})
export class ConfigurationComponent implements OnInit {

  currentAccessibility: CalendarAccessibility | null = null
  error: any | null = null;

  constructor(private calendarAccessibilityService: AccessibilityService) {}

  ngOnInit(): void {
    this.fetchAccessibility();
  }

  fetchAccessibility() {
    this.calendarAccessibilityService.fetch()
      .pipe(first())
      .subscribe({
        next: (value: CalendarAccessibility | null) => {
          this.currentAccessibility = value
        },
        error: (error) => {
          this.error = error;
        }
      });
  }

  updateAccessibility(type: AccessibilityType, checked: boolean, domains: string[] = []) {
    if(checked) {
      const observable = this.currentAccessibility != null ? this.calendarAccessibilityService.update({
        accessibilityType: type,
        domains: domains
      }) : this.calendarAccessibilityService.create({
        accessibilityType: type,
        domains: domains
      })

      observable.pipe(first())
        .subscribe({
          next: (value: CalendarAccessibility) => {
            this.currentAccessibility = value
          },
          error: (error) => {
            this.error = error;
          }
        })
    } else {
      this.deleteAccessibility();
    }
  }

  deleteAccessibility() {
    this.calendarAccessibilityService.delete().pipe(first())
      .subscribe({
        next: () => {
          this.currentAccessibility = null
        },
        error: (error) => {
          this.error = error;
        }
      })
  }

  isAccessible(type: AccessibilityType): boolean {
    if (this.currentAccessibility != null) {
      return this.currentAccessibility.accessibilityType === type.valueOf()
    }
    return false
  }

  get AccessibilityType(): typeof AccessibilityType {
    return AccessibilityType;
  }
}
