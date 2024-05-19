import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  navOptions: NavOption[] = [{
    id: 'calendar-setup',
    title: 'Calendar Setup',
    route: '/settings/calendar'
  },{
    id: 'configuration',
    title: 'Configuration',
    route: '/settings/configuration'
  },{
    id: 'account-info',
    title: 'Account Info',
    route: '/settings/account-info'
  },{
    id: 'availability',
    title: 'Availability',
    route: '/settings/availability'
  },{
    id: 'password',
    title: 'Password',
    route: '/settings/password'
  },{
    id: 'support',
    title: 'Support',
    route: '/settings/support'
  },{
    id: 'privacy-policy',
    title: 'Privacy Policy',
    route: '/settings/privacy-policy'
  }, {
    id: 'terms-conditions',
    title: 'Terms & Conditions',
    route: '/settings/terms-conditions'
  }];

  setting_title = this.navOptions[0]['title'];

  ngOnInit(): void {
  }

  changeTitle(title: string) {
    debugger;
    this.setting_title = title;
  }
}

interface NavOption {
  id: string;
  title: string;
  route: string;
}