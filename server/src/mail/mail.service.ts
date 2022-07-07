import { Injectable } from '@nestjs/common';
import * as Mailgun from 'mailgun-js';
import { IMailGunData } from './interfaces/mail.interface';
import {ConfigService} from "@nestjs/config";

@Injectable()
export class MailService { // TODO use (queue AMQP for send)
    private mg: Mailgun.Mailgun;

    constructor(readonly configService: ConfigService) {
        this.mg = Mailgun({
            apiKey: configService.get<string>('MAILGUN_API_KEY'),
            domain: configService.get<string>('MAILGUN_API_DOMAIN')
        });
    }

    send(data: IMailGunData): Promise<Mailgun.messages.SendResponse> {
        return new Promise((res, rej) => {
            this.mg.messages().send(data, function(error, body) {
                if (error) {
                    rej(error);
                }
                res(body);
            });
        });
    }
}
