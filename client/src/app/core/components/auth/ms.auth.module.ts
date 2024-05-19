import {MsalModule} from "@azure/msal-angular";
import {InteractionType, PublicClientApplication} from "@azure/msal-browser";
import {environment} from "../../../../environments/environment";

const storeCookie = window.navigator.userAgent.indexOf('MSIE ') > -1 || window.navigator.userAgent.indexOf('Trident/') > -1;

export const MsAuthModule =   MsalModule.forRoot( new PublicClientApplication({
  auth: {
    clientId: environment.ms_client_id,
    authority:  environment.ms_authority,
    redirectUri: environment.host
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: storeCookie
  }
}), {
  interactionType: InteractionType.Popup,
  authRequest: {
    scopes: ['user.read']
  }
}, {
  interactionType: InteractionType.Popup,
  protectedResourceMap: new Map([
    [environment.ms_graph_api, ['user.read']]
  ])
})
