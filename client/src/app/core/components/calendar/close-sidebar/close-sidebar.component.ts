import { Component, HostListener } from '@angular/core';
import { BroadcasterService } from 'src/app/shared/services';

@Component({
  selector: 'app-close-sidebar-btn',
  templateUrl: './close-sidebar.component.html',
  styleUrls: ['./close-sidebar.component.scss']
})
export class CloseSidebarButtonComponent {
    constructor(private broadcaster: BroadcasterService) {}
    
    close() {
        this.broadcaster.broadcast('calendar_full_size', true);
      }
    
      @HostListener('document:keydown.escape', ['$event']) onKeydownHandler(event: 
        KeyboardEvent) {
        this.close();
       }
}
