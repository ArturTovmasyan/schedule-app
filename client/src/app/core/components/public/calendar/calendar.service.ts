import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Subject, throwError } from 'rxjs';
import { Location } from '../../../interfaces/calendar/location.interface';
import { ApiResponse } from '../../../interfaces/response/api.response.interface';
import { MeetViaEnum } from '../../calendar/enums/sharable-links.enum';

@Injectable()
export class PublicCalendarService {

  calendarData: any;
  selectedWeek = new Subject();
  _selectedTimeSlot = null;
  timezone: string | null = null;

  locations: Location[] = [
    {
      title: 'Zoom',
      sub_title: 'Web Conference',
      available: true,
      image: 'assets/ic_zoom.svg',
      value: MeetViaEnum.Zoom,
    },
    {
      title: 'Google Meet',
      sub_title: 'Web Conference',
      available: true,
      image: 'assets/ic_google_meet.svg',
      value: MeetViaEnum.GMeet,
    },
    {
      title: 'Microsoft Teams',
      sub_title: 'Web Conference',
      available: true,
      image: 'assets/ic_msteams.svg',
      value: MeetViaEnum.Teams,
    },
    {
      title: 'Inbound phone call',
      sub_title: 'You will receive a phone call',
      available: true,
      image: 'assets/ic_inbound_call.svg',
      value: MeetViaEnum.InboundCall,
    },
    {
      title: 'Outbound phone call',
      sub_title: 'You will be making a phone call',
      available: true,
      image: 'assets/ic_outbound_call.svg',
      value: MeetViaEnum.OutboundCall,
    },
    {
      title: 'Physical address',
      sub_title: 'You will meet face to face',
      available: true,
      image: 'assets/ic_location.svg',
      value: MeetViaEnum.PhysicalAddress,
    },
  ];


  constructor(
    private readonly http: HttpClient
    ) {
    const timezone = new Date().toString().match(/([A-Z]+[\+-][0-9]+.*)/)?.[1] ?? null;
    this.timezone = timezone;
    }

    getDetails(id: string) {
        return this.http.get<ApiResponse<any>>(`/api/sharable-links/${id}`)
          .pipe(
            map((res: any) => {
              return res.data;
            }),
            catchError((error) => {
              return throwError(() => error);
            })
          );
    }

  openSelectedWeek() {
    return this.selectedWeek.asObservable();
  }

  getLocations() {
    return this.locations;
  }

  submitSelectedSlotInfo(slotId: string, formData: any) {
    return this.http.patch<ApiResponse<any>>(`/api/sharable-links/select-slot/public/${slotId}`, { ...formData });
  }

  cancelSelectedSlotMeeting(slotId: string, formData: any) {
    return this.http.patch<ApiResponse<any>>(`/api/sharable-links/cancel-slot/${slotId}`, { ...formData });
  }

  reScheduleMeeting(slotId: string, formData: any) {
    return this.http.patch<ApiResponse<any>>(`/api/sharable-links/reschedule-slot/${slotId}`, { ...formData });
  }

}
