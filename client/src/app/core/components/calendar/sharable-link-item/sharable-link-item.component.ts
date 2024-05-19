import {Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output} from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-sharable-link-item',
  templateUrl: './sharable-link-item.component.html',
  styleUrls: ['./sharable-link-item.component.scss']
})
export class SharableLinkItemComponent implements OnInit {
  
  @Input() link:any;
  @Output() deleteLinkEvent = new EventEmitter<void>();
  showDeletePopup = false;

  constructor(
    private readonly clipboard: Clipboard,
    private toastrService: ToastrService
  ) {
   
  }

  ngOnInit(): void {}


  deleteLinkPopup() {
    this.showDeletePopup = true;
  }

  deleteLink(type: boolean) {
    if (!type) {
      this.showDeletePopup = false;
      return;
    }
    this.deleteLinkEvent.emit();
  }

  copyLink(text: string) {
    this.clipboard.copy(text);
    this.toastrService.success('Copied to Clipboard', '', {
      timeOut: 3000,
      positionClass: 'toast-top-left'
    });
  }
}
