// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  host: 'http://localhost:4200/',
  ms_client_id: '8e86c1a1-9dd3-4334-9b6a-e1da7ecbedc8',
  ms_authority: 'https://login.microsoftonline.com/88d0f86a-6a15-4c30-9ad9-ded490a01b5f',
  ms_graph_api: 'https://graph.microsoft.com/v1.0/me',
  stripe_publish_key: 'pk_test_51LL6dnKV9se4cvHz6qUrEUkiLkK751ZsHjTwCTN6mIdAFO5orZiWDblyP22z5KAALnkXaMIr6Rz3O3LLjFCO6J6E00RYOPBjna'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
