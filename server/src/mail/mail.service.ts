import { Injectable } from '@nestjs/common';
import { ConfigService } from "@nestjs/config";
import * as SendGrid from '@sendgrid/mail';

@Injectable()
export class MailService { // TODO use (queue AMQP for send)

    constructor(readonly configService: ConfigService) {
        SendGrid.setApiKey(configService.get<string>('SENDGRID_API_KEY'));
    }

    send(mail: SendGrid.MailDataRequired): Promise<[SendGrid.ClientResponse, {}]> {
        return new Promise((resolve, reject) => {
            SendGrid.send(mail)
                .then((response) => resolve(response))
                .catch((error) => {
                    reject(error)
                });
        });
    }
}
