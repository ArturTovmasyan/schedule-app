import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { UserData } from '../chip-user-input/chip-user-input.component';

@Component({
  selector: 'app-chip-user-item',
  templateUrl: './chip-user-item.component.html',
  styleUrls: ['./chip-user-item.component.scss']
})
export class ChipUserItemComponent implements OnInit {
  @Input() user: UserData = {
    name: "",
    email: "",
    avatar: null,
    removable: false
  };

  @Input() mini: boolean = false
  @Input() borderClass: string = ""

  @Output() onRemove = new EventEmitter<void>();
  
  constructor() { }

  ngOnInit(): void {
  }

  remove(): void {
    this.onRemove.emit();
  }
}
