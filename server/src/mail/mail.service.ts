import { Injectable } from '@nestjs/common';
import * as Mailgun from 'mailgun-js';
import { IMailGunData } from './interfaces/mail.interface';

@Injectable()
export class MailService {
    private mg: Mailgun.Mailgun;

    constructor() {
        this.mg = Mailgun({
            apiKey: process.env.MAILGUN_API_KEY,
            domain: process.env.MAILGUN_API_DOMAIN,
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
