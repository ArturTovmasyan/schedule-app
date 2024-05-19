import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  isAuthenticated: boolean = false;
  isLogin: boolean = true;

  constructor() { }

  ngOnInit(): void {
  }

  get title() {
    return "Handshake";
  }

  get slogan() {
    return "Make meetings work!"
  }

}
