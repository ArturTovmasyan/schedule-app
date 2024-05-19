import { Connection } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { IResponse } from 'src/components/interfaces/response.interface';
import { User } from '@user/entity/user.entity';
import { ZoomOAuthToken } from './zoom/entity/zoom-oauth-token.entity';
import { CalendarToken } from 'src/calendar/calendar-permissions/entity/calendarToken.entity';
import { ILinkedIntegrations } from './zoom/interfaces/zoom.interface';
import { CalendarTypeEnum } from 'src/calendar/calendar-permissions/enums/calendarType.enum';

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
    const linkedData: ILinkedIntegrations[] = [
      {
        title: 'Inbound phone call',
        sub_title: 'You will receive a phone call',
        available: true,
      },
      {
        title: 'Outbound phone call',
        sub_title: 'You will be making a phone call',
        available: true,
      },
      {
        title: 'Physical address',
        sub_title: 'You will meet face to face',
        available: true,
      },
    ];

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

    linkedData.push(
      {
        title: 'Zoom',
        sub_title: 'Web Conference',
        available: !!zoomToken,
      },
      {
        title: 'Google Meet',
        sub_title: 'Web Conference',
        available: !!googleToken,
      },
      {
        title: 'Microsoft Teams',
        sub_title: 'Web Conference',
        available: !!MSToken,
      },
    );

    return { data: linkedData, metadata: {} };
  }
}
