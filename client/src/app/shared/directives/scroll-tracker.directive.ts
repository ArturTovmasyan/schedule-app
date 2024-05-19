import { Directive, Output, EventEmitter, HostListener } from '@angular/core';

@Directive({
  selector: '[scrollTracker]'
})
export class ScrollTrackerDirective {
  @Output() scrollingFinished = new EventEmitter<void>();

  emitted = false;

  @HostListener("scroll", ['$event'])
  onScroll(event: any): void {
    // do tracking
    // console.log('scrolled', event.target.scrollTop);
    // Listen to click events in the component
    const tracker = event.target;
    const limit = tracker.scrollHeight - tracker.clientHeight - 1;

    if (event.target.scrollTop === limit && !this.emitted) {
      this.emitted = true;
      this.scrollingFinished.emit();
    } else {
      this.emitted = false;
    }
  }

  // @HostListener(":scroll", [])
  // onScroll(): void {
  //   const scrollable = document.querySelectorAll('.list-unstyled')[0];

  //   console.log('yo man');
  //   if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight && !this.emitted) {
  //     console.log('yo man');
  //     this.emitted = true;
  //     this.scrollingFinished.emit();
  //   } else if ((window.innerHeight + window.scrollY) < document.body.offsetHeight) {
  //     this.emitted = false;
  //   }
  // }
}