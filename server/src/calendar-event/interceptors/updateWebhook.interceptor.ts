import {
  BadGatewayException,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CalendarPermissionsService } from '../../calendar-permissions/calendarPermissions.service';
import { CalendarTypeEnum } from '../../calendar-permissions/enums/calendarType.enum';
import { ClientsCredentialsService } from '../../clients-credentials/clients-credentials.service';
import { CalendarWebhookChannel } from '../entities/calendarWebhookChannel.entity';
import { CalendarToken } from '../../calendar-permissions/entity/calendarToken.entity';

@Injectable()
export class UpdateWebhookInterceptor implements NestInterceptor {
  constructor(
    @InjectRepository(CalendarWebhookChannel)
    private readonly calendarWebhookChannelRepository: Repository<CalendarWebhookChannel>,
    private readonly calendarPermissionsService: CalendarPermissionsService,
    private readonly clientsCredentials: ClientsCredentialsService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const user = context.switchToHttp().getRequest().user;

    this.calendarWebhookChannelRepository.manager.transaction(
      async (manager) => {
        const calendarWebhookChannelRepository = manager.getRepository(
          CalendarWebhookChannel,
        );
        const calendarTokenRepository = manager.getRepository(CalendarToken);

        const token = await calendarTokenRepository
          .createQueryBuilder()
          .where('"ownerId" = :userId', { userId: user.id })
          .andWhere('"calendarType" = :calendarType', {
            calendarType: CalendarTypeEnum.GoogleCalendar,
          })
          .getOne();

        const webhooks = await calendarWebhookChannelRepository
          .createQueryBuilder()
          .where('"ownerId" = :userId', { userId: user.id })
          .andWhere('"expiryDate" < now()')
          .getMany();

        for (const webhook of webhooks) {
          if (webhook.eventType === CalendarTypeEnum.GoogleCalendar) {
            console.log('to do');
          } else if (webhook.eventType === CalendarTypeEnum.Office365Calendar) {
            const updatedTokens =
              await this.calendarPermissionsService.msalInstance.acquireTokenByRefreshToken(
                {
                  scopes: [
                    'offline_access',
                    'Calendars.ReadWrite',
                    'openid',
                    'profile',
                    'User.Read',
                  ],
                  refreshToken: token.refreshToken,
                },
              );

            if (!updatedTokens.accessToken) {
              throw new BadGatewayException();
            }

            const calendarTokenBody = {
              id: token.id,
              accessToken: updatedTokens.accessToken,
              expiryDate: updatedTokens.expiresOn,
              extExpiryDate: updatedTokens.extExpiresOn,
            };

            await calendarTokenRepository.save(calendarTokenBody);
          }
        }
      },
    );
    return next.handle();
  }
}
