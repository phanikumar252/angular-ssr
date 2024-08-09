// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  // apiUrl: 'http://52.88.252.214:90/QADemoCurately/',
  // apiUrl: 'https://api.curately.ai/QADemoCurately/',
   apiUrl: 'http://35.155.202.216:8080/QADemoCurately/',

  // 'https://api.cxninja.com/DemoCurately/
  //http://35.155.202.216:8080/CSNinja-APIS/
  FrontEndURLForUser: 'http://localhost:4200/',
  IndeedRedirectURL: 'https://qa.cxninja.com',  //http://35.155.202.216:8080/incredibleme/
  FrontEndURLForContactus: 'https://www.csrninja.com/',  //http://35.155.202.216:8080/incredibleme/

  googleAnalyticsKey: 'G-VCJJWBWX45',//'G-F5B7WQR6RD'
  amazonS3: 'https://ova-qatest.s3.us-west-2.amazonaws.com/qacurately/',
  badgesPath: 'http://localhost:4200/assets/badge/',
  debounceApiKey: 'abced',
  GOOGLE_MAPS_API_KEY: 'AIzaSyBPvFpashJv6w5SFk_7HVO3Y_STF3NN3BQ',
  smartyKey: '96941924298018369',
  indeedKey: 'c09dbf5222b85688b3ce380fde5316fd4e6bdf337d0d4cdff0b5c7a9ec4501b5',
  indeedSecret: 'tu15EJ1woBbpvsjWC3Ttl1cxZnAakMrN5WLLnmNgWaCYZ2ISJx2mNBIsyvIzWuHz',
  baseUrl: "https://www.csrninja.com/",
  clientId: "",
  buildVersion: '15'

};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
