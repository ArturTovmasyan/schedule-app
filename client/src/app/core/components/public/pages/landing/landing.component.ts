import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { ViewportScroller } from "@angular/common";
import { BroadcasterService } from 'src/app/shared/services';
import { BehaviorSubject } from 'rxjs';
import MockTestimonials  from '../../data/testimonials';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingPageComponent implements OnDestroy, AfterViewInit {
  subscription: BehaviorSubject<string>;
  mockTestimonials: any[] = MockTestimonials;
  @ViewChild('carousel') carousel!: ElementRef<HTMLInputElement>;
  @ViewChild('content') content!: ElementRef<HTMLInputElement>;
  @ViewChild('next') next!: ElementRef<HTMLInputElement>;
  @ViewChild('prev') prev!: ElementRef<HTMLInputElement>;

  @ViewChild('testimonialCarousel') testimonialCarousel!: ElementRef<HTMLInputElement>;
  @ViewChild('testimonialContent') testimonialContent!: ElementRef<HTMLInputElement>;
  @ViewChild('testimonialNext') testimonialNext!: ElementRef<HTMLInputElement>;
  @ViewChild('testimonialPrev') testimonialPrev!: ElementRef<HTMLInputElement>;

  constructor(
    private scroller: ViewportScroller,
    private broadcaster: BroadcasterService,
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

  ngAfterViewInit() {
    const gap = 16;
    // const width = getComputedStyle(this.carousel.nativeElement).width;
    const width = this.carousel.nativeElement.offsetWidth;
    this.prev.nativeElement.addEventListener("click", e => {
      this.carousel.nativeElement.scrollBy(-(width + gap), 0);
    });
    this.next.nativeElement.addEventListener("click", e => {
      this.carousel.nativeElement.scrollBy(width + gap, 0);
    });

    const testimonialWidth = this.testimonialCarousel.nativeElement.offsetWidth;
    this.testimonialPrev.nativeElement.addEventListener("click", e => {
      this.testimonialCarousel.nativeElement.scrollBy(-(testimonialWidth + gap), 0);
    });
    this.testimonialNext.nativeElement.addEventListener("click", e => {
      this.testimonialCarousel.nativeElement.scrollBy(testimonialWidth + gap, 0);
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
