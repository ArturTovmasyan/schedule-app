import { Connection } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { IResponse } from 'src/components/interfaces/response.interface';
import { User } from '@user/entity/user.entity';
import { ZoomOAuthToken } from './zoom/entity/zoom-oauth-token.entity';
import { CalendarToken } from 'src/calendar/calendar-permissions/entity/calendarToken.entity';
import { ILinkedIntegrations } from './zoom/interfaces/zoom.interface';
import { CalendarTypeEnum } from 'src/calendar/calendar-permissions/enums/calendarType.enum';
import { MeetViaEnum } from 'src/sharable-links/enums/sharable-links.enum';

@Injectable()
export class IntegrationsService {
  constructor(private readonly connection: Connection) {}

  /**
   * @description `Get linked integrations of user`
   * @param user - `Authorized user data`
   * @returns `Array of ILinkedIntegrations object`
   */

  async getLinkedIntegrations(
    user: User,
  ): Promise<IResponse<ILinkedIntegrations[]>> {
    const [zoomToken, googleToken, MSToken] = await Promise.all([
      this.connection
        .getRepository(ZoomOAuthToken)
        .count({ where: { user: { id: user.id } } }),
      this.connection.getRepository(CalendarToken).count({
        where: {
          owner: { id: user.id },
          calendarType: CalendarTypeEnum.GoogleCalendar,
        },
      }),
      this.connection.getRepository(CalendarToken).count({
        where: {
          owner: { id: user.id },
          calendarType: CalendarTypeEnum.Office365Calendar,
        },
      }),
    ]);

    const linkedData: ILinkedIntegrations[] = [
      {
        title: 'Zoom',
        sub_title: 'Web Conference',
        available: !!zoomToken,
        image: 'assets/ic_zoom.svg',
        value: MeetViaEnum.Zoom,
      },
      {
        title: 'Google Meet',
        sub_title: 'Web Conference',
        available: !!googleToken,
        image: 'assets/ic_google_meet.svg',
        value: MeetViaEnum.GMeet,
      },
      // {
      //   title: 'Microsoft Teams',
      //   sub_title: 'Web Conference',
      //   available: !!MSToken,
      //   image: 'assets/ic_msteams.svg',
      //   value: MeetViaEnum.Teams,
      // },
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

    return { data: linkedData, metadata: {} };
  }
}
