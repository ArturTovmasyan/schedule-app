import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
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
  @ViewChild('domainInput')
  domainInput!: ElementRef;
  currentAccessibility: CalendarAccessibility | null = null
  currentDisplaySection: Section = Section.NONE;
  error: any | null = null;

  constructor(private calendarAccessibilityService: AccessibilityService) {}

  ngOnInit(): void {
    this.fetchAccessibility();
  }

  get domains(): string[] {
    return this.currentAccessibility?.domains ?? [];
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
      const data = {
        accessibilityType: type,
        domains: domains.length == 0 ? null : domains
      };
      const observable = this.currentAccessibility != null ? this.calendarAccessibilityService.update(data) : this.calendarAccessibilityService.create(data)

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

    if(type == AccessibilityType.DOMAIN) {
      this.currentDisplaySection = checked ? Section.DOMAIN : Section.NONE;
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

  toggleSection(section: Section) {
    this.currentDisplaySection = this.currentDisplaySection == section ? Section.NONE : section;
  }

  isVisible(section: Section): boolean {
    return this.currentDisplaySection == Section.NONE || this.currentDisplaySection == section;
  }

  addDomain() {
    const domain = this.domainInput.nativeElement.value.replace('@', '');
    if((this.currentAccessibility?.domains ?? []).indexOf(domain) < 0) {
      const domains = [...this.currentAccessibility?.domains ?? [], domain];
      this.updateAccessibility(AccessibilityType.DOMAIN, true, domains);
    }
    this.domainInput.nativeElement.value = "";
  }

  removeDomain(index: number) {
    const domains = [...this.currentAccessibility?.domains ?? []];
    domains.splice(index, 1);
    this.updateAccessibility(AccessibilityType.DOMAIN, true, domains);
  }

  get AccessibilityType(): typeof AccessibilityType {
    return AccessibilityType;
  }

  get Section(): typeof Section {
    return Section;
  }
}

enum Section {
  NONE,
  PUBLIC,
  DOMAIN,
  REQUEST
}
