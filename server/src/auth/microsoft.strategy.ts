import { Injectable } from '@nestjs/common';
import { PassportStrategy } from "@nestjs/passport";
import { BearerStrategy } from 'passport-azure-ad'

@Injectable()
export class AzureADStrategy extends PassportStrategy(BearerStrategy, 'oauth-bearer')
{
    constructor()
    {
        super({
            identityMetadata: "https://login.microsoftonline.com/88d0f86a-6a15-4c30-9ad9-ded490a01b5f",
            clientID: '8e86c1a1-9dd3-4334-9b6a-e1da7ecbedc8 ',
        })
    }

    async validate(response: any)
    {
        const { unique_name }: {unique_name: string} = response;
        if (unique_name) return unique_name;
        else return null;
    }
}
