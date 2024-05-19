import {
  BadGatewayException,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { InjectRepository } from '@nestjs/typeorm';
import { CalendarToken } from '../../calendar-permissions/entity/calendarToken.entity';
import { Repository } from 'typeorm';
import { CalendarPermissionsService } from '../../calendar-permissions/calendarPermissions.service';
import { CalendarTypeEnum } from '../../calendar-permissions/enums/calendarType.enum';

@Injectable()
export class UpdateAccessTokenInterceptor implements NestInterceptor {
  constructor(
    @InjectRepository(CalendarToken)
    private readonly calendarTokenRepository: Repository<CalendarToken>,
    private readonly calendarPermissionsService: CalendarPermissionsService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const user = context.switchToHttp().getRequest().user;

    this.calendarTokenRepository.manager.transaction(async (manager) => {
      const calendarTokenRepository = manager.getRepository(CalendarToken);

      const tokens = await calendarTokenRepository
        .createQueryBuilder()
        .where('"ownerId" = :userId', { userId: user.id })
        .andWhere('"expiryDate" < now()')
        .getMany();

      for (const token of tokens) {
        if (token.calendarType === CalendarTypeEnum.GoogleCalendar) {
          await this.calendarPermissionsService.googleOAuth2Client.setCredentials(
            {
              refresh_token: token.refreshToken,
            },
          );

          const refreshRes =
            await this.calendarPermissionsService.googleOAuth2Client.refreshAccessToken();

          if (refreshRes.res.status !== 200) {
            throw new BadGatewayException();
          }

          const updatedTokens = refreshRes.res.data;

          const calendarTokenBody = {
            id: token.id,
            accessToken: updatedTokens.access_token,
            refreshToken: updatedTokens.refresh_token,
            expiryDate: new Date(updatedTokens.expiry_date).toISOString(),
          };

          await calendarTokenRepository.save(calendarTokenBody);
        } else if (token.calendarType === CalendarTypeEnum.Office365Calendar) {
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
    });
    return next.handle();
  }
}
