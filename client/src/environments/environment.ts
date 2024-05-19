// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  host: 'http://localhost:4200/',
  ms_client_id: '8612bd9c-2d7d-48bb-84a5-55984f126de4',
  ms_authority: 'https://login.microsoftonline.com/f8cdef31-a31e-4b4a-93e4-5f571e91255a',
  ms_redirect_url: 'http://localhost:4200/api/auth/microsoft/callback'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
