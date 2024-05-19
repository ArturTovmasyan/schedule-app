import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as SendGrid from '@sendgrid/mail';

@Injectable()
export class MailService {

  constructor(readonly configService: ConfigService) {
    SendGrid.setApiKey(configService.get<string>('SENDGRID_API_KEY'));
  }

  get defaultTemplateData(): object {
    return {
      "contact_address": this.configService.get("CONTACT_ADDRESS"),
      "contact_num": this.configService.get("CONTACT_NUM"),
      "support_email": this.configService.get("SUPPORT_EMAIL"),
      "facebook_url": this.configService.get("FACEBOOK_URL"),
      "slack_url": this.configService.get("SLACK_URL"),
      "twitter_url": this.configService.get("TWITTER_URL"),
      "linkedin_url": this.configService.get("LINKEDIN_URL")
    }
  }

  send(
    mail: SendGrid.MailDataRequired,
  ): Promise<[SendGrid.ClientResponse, {}]> {
    return new Promise((resolve, reject) => {
      SendGrid.send(mail)
        .then((response) => resolve(response))
        .catch((error) => {
          reject(error);
        });
    });
  }
}

export enum MailTemplate {
  CONFIRM_ACCOUNT = "d-1894dce5db19424584846fcf3abbeb6d",
  RESET_PASSWORD = "d-8fe5e7f8c89848c999ef76f8bbf5720a",
  PASSWORD_CHANGED = "d-686aa43bf57c4e2f91bbc7a841289411",
  CALENDAR_REQUESTED = "d-d4584180bfb747a489515e42a6f86293",
  CALENDAR_SHARED = "d-57b6775892d1450c81d04ed9734dba38",
  INVITE_EMAIL = "d-309e0fdf36984964a9af0f7c7f4907b6"
}
