import { Component, OnInit } from '@angular/core';
import {
  Router,
  Event as NavigationEvent,
  NavigationCancel,
  NavigationEnd,
  NavigationError
} from '@angular/router';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {

  constructor(
    private router: Router,
  ) { }

  ngOnInit(): void {
    // for scroll to top while navigating
    this.router.events.subscribe((event: NavigationEvent) => {
      if (event instanceof NavigationError || event instanceof NavigationCancel || event instanceof NavigationEnd) {
          const contentContainer =
            document.querySelector('body') || window;
          if (contentContainer) {
            contentContainer.scrollTo(0, 0);
          }
      }
    });
  }

}
