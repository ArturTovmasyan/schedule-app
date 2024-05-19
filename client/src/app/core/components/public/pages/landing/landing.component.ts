import { Component, OnDestroy } from '@angular/core';
import { ViewportScroller } from "@angular/common";
import { BroadcasterService } from 'src/app/shared/services';
import { BehaviorSubject } from 'rxjs';
import MockTestimonials  from '../../data/testimonials';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingPageComponent implements OnDestroy {
  subscription: BehaviorSubject<string>;
  mockTestimonials: any[] = MockTestimonials;
  constructor(
    private scroller: ViewportScroller,
    private broadcaster: BroadcasterService
  ) {
    this.broadcaster.broadcast('isAuthPage', false);
    this.broadcaster.broadcast('isLandingPage', true);

    this.subscription = this.broadcaster.on('goToSection').subscribe((data: string) => {
      this.goToSection(data);
    });
  }

  goToSection(section: string) {
    this.scroller.scrollToAnchor(section);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
