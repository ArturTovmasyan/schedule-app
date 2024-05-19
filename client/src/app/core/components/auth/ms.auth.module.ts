import {MsalModule} from "@azure/msal-angular";
import {InteractionType, PublicClientApplication} from "@azure/msal-browser";
import {environment} from "../../../../environments/environment";

const storeCookie = window.navigator.userAgent.indexOf('MSIE ') > -1 || window.navigator.userAgent.indexOf('Trident/') > -1;

export const MsAuthModule = MsalModule.forRoot(new PublicClientApplication({
  auth: {
    clientId: environment.ms_client_id,
    authority: environment.ms_authority,
    redirectUri: environment.ms_redirect_url
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: storeCookie// For Internet Explorer
  }
}), {
  interactionType: InteractionType.Redirect,
  authRequest: {
    scopes: ['user.read']
  }
}, {
  interactionType: InteractionType.Redirect,
  protectedResourceMap: new Map([
    ['https://graph.microsoft.com/v1.0/me', ['user.read']]
  ])
})
