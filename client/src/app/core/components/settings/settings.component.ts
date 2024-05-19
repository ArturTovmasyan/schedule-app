import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { CommonService } from '../../services/common.service';

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
  }];


  setting_title = this.navOptions[0]['title'];

  timezone = "";

  constructor(private readonly commonService: CommonService) {
    this.timezone = this.commonService.formattedLocalTimezone;
  }

  ngOnInit(): void {
  }

  get env() {
    return environment;
  }

  changeTitle(title: string) {
    this.setting_title = title;
  }
}

interface NavOption {
  id: string;
  title: string;
  route: string;
}