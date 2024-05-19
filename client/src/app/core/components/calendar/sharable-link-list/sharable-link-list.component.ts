import { Component, OnInit, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { SharableLinkService } from 'src/app/core/services/calendar/sharable-link.service';
import { BroadcasterService } from "../../../../shared/services";
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
      if (res.data.length && res.metadata.count > this.page.limit) {
        this.nextPage = 'true';
      } else {
        this.nextPage = null;
      }
      const results = res.data;
      const slots = [];
      for (let i = 0; i < results.length; i++) {
        for (const date of results[i].slots) {
          slots.push(date);
        }
        const context = {
          item: results[i]
        };
        this.container.createEmbeddedView(this.template, context);
      }
      this.broadcaster.broadcast('addSharableLinkTimeSlot', slots);
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

  deleteLink(id: any) {
    this.sharableLinkService.deleteLink(id)
    .subscribe({
      next: (res: any) => {
        if (res?.message == 'Deleted') {
          this.toastrService.success('Successfully Deleted!', '', {
            timeOut: 3000,
            positionClass: 'toast-top-left'
          });
          this.container.clear();
          this.loadSharableLinks();
        }
      },
      error: (err: any) => {
        this.toastrService.error(err?.message, 'Error On Delete', {
          timeOut: 3000,
          positionClass: 'toast-top-left'
        });
      }
    });
    
  }

  close() {
    this.broadcaster.broadcast('calendar_full_size', true);
  }
}
