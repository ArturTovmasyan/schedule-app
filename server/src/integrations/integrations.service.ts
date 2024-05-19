import { Connection } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { IResponse } from 'src/components/interfaces/response.interface';
import { User } from '@user/entity/user.entity';
import { ZoomOAuthToken } from './zoom/entity/zoom-oauth-token.entity';
import { CalendarToken } from 'src/calendar/calendar-permissions/entity/calendarToken.entity';
import { ILinkedIntegrations } from './zoom/interfaces/zoom.interface';

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
        title: 'Microsoft Teams',
        sub_title: 'Web Conference',
        available: true,
      },
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

    const [zoomToken, googleToken] = await Promise.all([
      this.connection
        .getRepository(ZoomOAuthToken)
        .count({ where: { user: { id: user.id } } }),
      this.connection
        .getRepository(CalendarToken)
        .count({ where: { owner: { id: user.id } } }),
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
    );

    return { data: linkedData, metadata: {} };
  }
}
