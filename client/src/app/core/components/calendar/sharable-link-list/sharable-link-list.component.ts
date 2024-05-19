import { Component, EventEmitter, OnInit, Output, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { SharableLinkService } from 'src/app/core/services/calendar/sharable-link.service';
import {BroadcasterService} from "../../../../shared/services";
import { tap } from 'rxjs';
import { Clipboard } from '@angular/cdk/clipboard';
import { ToastrService } from 'ngx-toastr';
import { Page } from 'src/app/shared/models/page';

@Component({
  selector: 'app-sharable-link-list',
  templateUrl: './sharable-link-list.component.html',
  styleUrls: ['./sharable-link-list.component.scss']
})
export class SharableLinkListComponent implements OnInit {
  page = new Page();
  pageNumber = 0;
  nextPage!: string | null;
  isAttendees = true;
  sharableLinkList = [];

  @ViewChild('itemsContainer', { read: ViewContainerRef }) container!: ViewContainerRef;
  @ViewChild('item', { read: TemplateRef }) template!: TemplateRef<any>;

  constructor(
    private readonly broadcaster: BroadcasterService,
    private readonly sharableLinkService: SharableLinkService,
    private readonly clipboard: Clipboard,
    private toastrService: ToastrService
  ) { }

  ngOnInit(): void {
    this.loadSharableLinks();
  }

  loadSharableLinks() {
    const params: any = {
      'offset': this.page.offset,
      'limit': this.page.limit,
      'isAttendees': this.isAttendees
    }
    this.sharableLinkService.getLinks(params)
    .subscribe((res: any) => {
      console.log(res.data.length);
      if (res.data.length && res.metadata.count > this.page.limit) {
        this.nextPage = 'true';
      } else {
        this.nextPage = null;
      }
      const results = res.data;
      for (let i = 0; i < results.length; i++) {
        const context = {
          item: results[i]
        };
        this.container.createEmbeddedView(this.template, context);
      }
    })
  }

  copyLink(text: string) {
    this.clipboard.copy(text);
    this.toastrService.success('Copied to Clipboard', '', {
      timeOut: 3000,
      positionClass: 'toast-top-left'
    });
  }

  onScrollingFinished() {
    if (this.nextPage) {
      this.pageNumber += 1;
      this.page.offset = this.pageNumber * this.page.limit;
      this.loadSharableLinks();
    }
  }

  deleteLink() {
    console.log('delete link');
  }

  close() {
    this.broadcaster.broadcast('calendar_full_size', true);
  }
}
