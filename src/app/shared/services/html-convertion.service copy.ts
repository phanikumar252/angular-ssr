import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class HtmlConvertionService {
  candData = {
    name: '',
    location: '',
    firstName: '',
    lastName: '',
    jobTitle: '',
    email: '',
    phoneNo: '',
    cityName: '',
    stateName: '',
    countryName: '',
    zipcode: '',
    careersummary: '',
    empHistory: [],
    education: [],
    skills: [],
    socialsLinks: [],
    languages: [],
    certficationList: [],
    trainingList: [],
    currEmpStatus: '',
    availability: '',
    empPerf: '',
    flexibilityPref: '',
    compensationPref: '',
    travelPrefPercent: '',
    travelPrefMiles: '',
    relocationPref: '',
    legalUS: '',
    requireVisa: '',
    payRate: '',
    payType: '',
    empHourCompensation: '',
    empPrefLocation: '',
    empPrefRoleTitle: '',
    miles: '',
  };
  empHistoryElements = '';
  educationElements = '';
  skillsElements = '';
  socialsLinksElements = '';
  languagesElements = '';
  certificateElements = '';
  TrainingElements = '';

  constructor() {
    // this.candData = {
    //   name: '',
    //   location: '',
    //   firstName: '',
    //   lastName: '',
    //   jobTitle: '',
    //   email: '',
    //   phoneNo: '',
    //   cityName: '',
    //   stateName: '',
    //   countryName: '',
    //   zipcode: '',
    //   careersummary: '',
    //   empHistory: [],
    //   education: [],
    //   skills: [],
    //   socialsLinks: [],
    //   languages: [],
    //   currEmpStatus: '',
    //   availability: '',
    //   empPerf: '',
    //   flexibilityPref: '',
    //   compensationPref: '',
    //   travelPref: '',
    //   relocationPref: '',
    //   rolePref: '',
    //   legalUS: '',
    //   requireVisa: ''
    // }
  }
  loadData(obj: any) {
    this.candData = obj;
    console.log(this.candData);

    this.candData.legalUS == '1'
      ? 'Yes'
      : this.candData.legalUS == '2'
      ? 'No'
      : '';
    this.candData.requireVisa == '1'
      ? 'Yes'
      : this.candData.requireVisa == '2'
      ? 'No'
      : '';

    this.empHistoryElements = '';
    this.candData.empHistory.forEach((el: any) => {
      // let listResponsi = el.empResponsibilities.split('\r\n');
      // let tempList = '';
      // listResponsi.forEach((listEle: any) => {
      //   tempList += `<li style='line-height: 30px; margin: 5px 0 0;'>
      //               ${listEle}
      //           </li>`;
      // });
      this.empHistoryElements += `<li class='innerpadding emprecord' style='line-height: 30px;padding: 0 30px;'>
          <div class='companydata'>
              <h4 style='font-family: Jost, sans-serif;font-weight: normal;font-size: 22px;margin-bottom: 5px;'>${
                el.jobTitle
              } | ${el.companyName}</h4>
              <span class='subheading' style='color: #969EB5;'>${el.startDate.substring(
                0,
                4
              )} - ${
        el.currentCompany ? 'Present' : el.endDate.substring(0, 4)
      } |
                  ${el.workAddress}</span>
          </div>
          <ul class='jobsmry' style='font-family: Open Sans, sans-serif;list-style-type: disc;padding: 0;margin: 10px 25px;'>
              ${el.empResponsibilities.replace(/\r\n/g, '<br>')}
          </ul>
      </li>`;
    });
    this.educationElements = ``;
    this.candData.education.forEach((el: any) => {
      this.educationElements += `<li class='innerpadding' style='line-height: 30px; padding: 0 30px;'>
          <div class='companydata'>
              <h4 style='font-weight: normal;font-size: 22px;font-family: Jost, sans-serif;margin-bottom: 5px;'>${
                el.degreeName
              } | ${
        el.degreeType
      } <span class='years float-right' style='font-size: 16px;color: #969EB5;float: right!important;font-weight: normal;'>${el.degreeCompletionDate.substring(
        0,
        4
      )}</span>
              </h4>
              <span class='subheading' style='color: #969EB5;'>${
                el.schoolName
              }</span>
          </div>
      </li>`;
    });
    this.certificateElements = '';
    this.candData.certficationList.forEach((el: any) => {
      this.certificateElements += `<li class='innerpadding' style='line-height: 30px; padding: 0 30px;'>
          <div class='companydata'>
              <h4 style='font-weight: normal;font-size: 22px;font-family: Jost, sans-serif;margin-bottom: 5px;'>${
                el.certName
              }<span class='years float-right' style='font-size: 16px;color: #969EB5;float: right!important;font-weight: normal;'>${el.completedYear.substring(
        0,
        4
      )}</span>
              </h4>
              <span class='subheading' style='color: #969EB5;'>${
                el.authorityName
              }</span>
          </div>
      </li>`;
      // certValue: "License"
    });
    this.TrainingElements = '';
    this.candData.trainingList.forEach((el: any) => {
      this.TrainingElements += `<li class='innerpadding'>
          <div class='companydata'>
              <h4>${
                el.institutionName
              }<span class='years float-right'>${el.completedYear.substring(
        0,
        4
      )}</span>
              </h4>
              <span class='subheading'>${el.trainingName}</span>
          </div>
      </li>`;
      // certValue: "License"
    });

    this.skillsElements = ``;
    this.candData.skills.forEach((el: any) => {
      this.skillsElements += `<li style='line-height: 30px;'>
          <span class='skillname'>${el.skillName}</span>
          <span class='skillrating float-right' >
            ${el.skillValue ? ' | ' + el.skillValue : ''}
          </span>
      </li>`;
      // isManual: false
      // skillID: 79
      // skillLevelID: 10004002
      // skillName: "adobe xd"
      // skillValue: "Intermediate"
      // userId: 34
      // userSkillID: 1041
    });
    this.socialsLinksElements = ``;
    this.candData.socialsLinks.forEach((el: any) => {
      this.socialsLinksElements += `<li style='line-height: 30px; margin-top: 5px; line-height: 35px;'>
          <i class='fas fa-basketball-ball'></i>
          <a href='${el.socialURL}' style='color:#111111;text-decoration:none;display:inline-block;margin-left: 10px;'>${el.socialURL}</a>
      </li>`;
    });
    this.languagesElements = ``;
    this.candData.languages.forEach((el: any) => {
      this.languagesElements += `<li style='line-height: 30px; display: flex; justify-content: space-between;'>
          <span class='skillname'>${el.langName}</span>
          <span class='tag' style='color: #777981;border: 1px solid #D8DDE8;border-radius: 30px;font-size: 14px;padding: 0px 15px;line-height: 22px;margin: 5px 0px;height: 25px;overflow: hidden;'>${el.langValue}</span>
      </li>`;
    });
    // <meta charset='UTF-8'>
    // <meta http-equiv='X-UA-Compatible' content='IE=edge'>
    // <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    // <link rel='preconnect' href='https://fonts.googleapis.com'>
    // <link rel='preconnect' href='https://fonts.gstatic.com' crossorigin>

    // <head>
    //     <title>${this.candData.firstName} ${this.candData.lastName}</title>

    // </head>

    // <link rel='preconnect' href='https://fonts.gstatic.com' crossorigin>
    // <link href='https://fonts.googleapis.com/css2?family=Jost:wght@400;700&family=Open+Sans:wght@400;700&display=swap' rel='stylesheet'>
    const allEles = `<!DOCTYPE html>
    <html lang='en'>

    <body>
        <div id='wrapper' style='margin: 0px auto;max-width: 98%;overflow: hidden;'>
            <section id='pdfheader' style='margin-bottom: 15px; margin-top: 30px;'>
                <div class='container card' style='border-radius: 10px !important;box-shadow: 0px 0px 15px rgb(0 0 0 / 10%);margin: 10px auto;padding: 30px;position: relative;flex-direction: column;min-width: 0;word-wrap: break-word;background-color: #fff;background-clip: border-box;border: 1px solid rgba(0,0,0,.125);width: 100%;max-width: 1140px;padding-right: 15px;padding-left: 15px;margin-right: auto;margin-left: auto;'>
                    <div class='row'
                        style='display: -ms-flexbox;display: flex;-ms-flex-wrap: wrap;flex-wrap: wrap;margin-right: -15px;margin-left: -15px;'>
                        <div class='col-6'
                            style='position: relative;width: 47%;padding-right: 15px;padding-left: 15px;max-width: 50%;'>
                            <div class='row d-flex align-items-center' style='display: -ms-flexbox;display: flex;-ms-flex-wrap: wrap;flex-wrap: wrap;margin-right: -15px;margin-left: -15px;display: -ms-flexbox !important;display: flex !important;-ms-flex-align: center !important;align-items: center !important;'>
                                <div class='col-4'
                                    style='position: relative;padding-right: 15px;padding-left: 15px;max-width: 33.333333%;'>
                                    <div class='avatar' style='width: 150px;height: 150px;min-width: 120px;min-height: 120px;border: 1px solid #D1D5E1;overflow: hidden;border-radius: 100%;'>
                                        <img src='assets/images/avatar.png' alt=''></img>
                                    </div>
                                </div>
                                <div class='col-8' style='position: relative;padding-right: 15px;padding-left: 15px;max-width: 66.666667%;'>
                                    <div class='candata'>
                                        <h2 style='font-family: Jost, sans-serif;margin-bottom:0;text-transform: capitalize;'>${this.candData.firstName} ${this.candData.lastName}
                                        </h2>
                                        <ul class='mb-0' style='font-family: Open Sans, sans-serif;margin-bottom: 0 !important;margin-top: 0;list-style-type: none;padding: 0;'>
                                            <li style='line-height: 30px;text-transform: capitalize;'>
                                            <i class='fa fa-briefcase'></i>${this.candData.jobTitle}</li>
                                            <li style='line-height: 30px;'><i
                                                    class='fa fa-map-marker-alt'></i> ${this.candData.cityName}, ${this.candData.stateName}</li>
                                            <li style='line-height: 30px;'>
                                            <span class='hire tag' style='background-color: #E5F9E7;border: none;color: #111;padding: 5px 15px;margin-top: 5px;display: inline-block;line-height: 15px;'><i class='fas fa-circle'></i> Available for Hire</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class='col-6 d-flex align-items-center justify-content-end text-right' style='position: relative;width: 47%;padding-right: 15px;padding-left: 15px;max-width: 50%;display: -ms-flexbox !important;display: flex !important;-ms-flex-align: center !important;align-items: center !important;-ms-flex-pack: end !important;justify-content: flex-end !important;text-align: right !important;'>
                            <ul class='contactinfo' style='font-family: Open Sans, sans-serif;list-style-type: none;padding: 0;'>
                                <li style='line-height: 30px;'> <i class='fa fa-mobile'></i>
                                    <a href='tel:+917566610101'
                                        style='color:#111111;text-decoration:none;display:inline-block;margin-left: 10px;'>${this.candData.phoneNo}</a>
                                </li>
                                <li style='line-height: 30px;'> <i class='fa fa-envelope'></i> <a
                                        href='${this.candData.email}'
                                        style='color:#111111;text-decoration:none;display:inline-block;margin-left: 10px;'>
                                        ${this.candData.email}</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>
            <section id='pdfbody' style='margin-top: 15px; margin-bottom: 15px;'>
                <div class='container' style='width: 100%;max-width: 1140px;padding-right: 15px;padding-left: 15px;margin-right: auto;margin-left: auto;'>
                    <div class='row'
                        style='display: -ms-flexbox;display: flex;-ms-flex-wrap: wrap;flex-wrap: wrap;margin-right: -15px;margin-left: -15px;'>
                        <!-- Left Section -->
                        <div class='col-12 card px-0' style='position: relative;width: 100%;padding-right: 15px;padding-left: 15px;-ms-flex: 0 0 100%;flex: 0 0 100%;max-width: 100%;border-radius: 10px !important;box-shadow: 0px 0px 15px rgb(0 0 0 / 10%);margin: 10px auto;padding: 30px;position: relative;flex-direction: column;min-width: 0;word-wrap: break-word;background-color: #fff;background-clip: border-box;border: 1px solid rgba(0,0,0,.125);padding-right: 0 !important;padding-left: 0 !important;'>
                            <div>
                                <!-- Career Summary -->
                                <section id='smry' class='innerpadding mt-0' style='padding: 0 30px;margin-top: 0!important;margin-bottom: 30px;margin-top: 30px;'>
                                    <h3
                                        style='font-family: Jost, sans-serif;margin-bottom: 15px; font-size: 1.75rem; line-height: 1.2; margin-top: 0;'>
                                        Professional Summary</h3>
                                    <p
                                        style='line-height: 30px;margin-top: 0;margin-bottom: 1rem; font-family: Open Sans, sans-serif;'>
                                        ${this.candData.careersummary}
                                    </p>
                                </section>
                                <hr style='margin-top: 1rem;margin-bottom: 1rem;border: 0;border-top: 1px solid rgba(0,0,0,.1);height: 0;overflow: visible;'></hr>
                                <!-- Employment History -->
                                <section id='emphistory' style='margin-bottom: 30px;margin-top: 30px;'>
                                    <h3 class='innerpadding' style='font-family: Jost, sans-serif;margin-bottom: 15px; font-size: 1.75rem; line-height: 1.2; margin-top: 0; padding: 0 30px;'> Employment History</h3>
                                    <ul class='emplist' style='font-family: Open Sans, sans-serif;list-style-type:none;padding: 0;'>
                                        ${this.empHistoryElements}
                                    </ul>
                                </section>
                                <hr style='margin-top: 1rem;margin-bottom: 1rem;border: 0;border-top: 1px solid rgba(0,0,0,.1);height: 0;overflow: visible;'></hr>
                                <!-- Education -->
                                <section id='edu' style='margin-bottom: 30px;margin-top: 30px;'>
                                    <h3 class='innerpadding'
                                        style='padding: 0 30px;font-family: Jost, sans-serif;margin-bottom: 15px; font-size: 1.75rem; line-height: 1.2; margin-top: 0;'>
                                        Education
                                    </h3>
                                    <ul class='stripe' style='font-family: Open Sans, sans-serif;list-style-type: none;padding: 0;'>
                                        ${this.educationElements}
                                    </ul>
                                </section>
                                <hr style='margin-top: 1rem;margin-bottom: 1rem;border: 0;border-top: 1px solid rgba(0,0,0,.1);height: 0;overflow: visible;'></hr>
                                <!-- Certification -->
                                <section id='certifications' style='margin-bottom: 30px;  margin-top: 30px;'>
                                    <h3 class='innerpadding' style='padding: 0 30px; font-family: Jost, sans-serif;margin-bottom: 15px; font-size: 1.75rem; line-height: 1.2; margin-top: 0;'>
                                        License & Certification</h3>
                                    <ul class='stripe'
                                        style='font-family: Open Sans, sans-serif;list-style-type: none;padding: 0;'>
                                        ${this.certificateElements}
                                    </ul>
                                </section>
                                <hr style='margin-top: 1rem;margin-bottom: 1rem;border: 0;border-top: 1px solid rgba(0,0,0,.1);height: 0;overflow: visible;'></hr>
                                <!-- Training -->
                                <section id='trainings' style='margin-bottom: 30px;  margin-top: 30px;'>
                                    <h3 class='innerpadding' style='padding: 0 30px; font-family: Jost, sans-serif;margin-bottom: 15px; font-size: 1.75rem; line-height: 1.2; margin-top: 0;'>
                                      Trainings</h3>
                                    <ul class='stripe'
                                        style='font-family: Open Sans, sans-serif;list-style-type: none;padding: 0;'>
                                        ${this.TrainingElements}
                                    </ul>
                                </section>
                            </div>
                        </div>
                        <!-- Right Sidebar -->
                        <div class='col-12 px-0 aside' style='position: relative;width: 100%;padding-right: 15px;padding-left: 15px;-ms-flex: 0 0 100%;flex: 0 0 100%;max-width: 100%;'>
                            <div class='row' style='display: -ms-flexbox;display: flex;-ms-flex-wrap: wrap;flex-wrap: wrap;margin-right: -15px;margin-left: -15px;padding-right: 0 !important;padding-left: 0 !important;'>
                                <div class='col-6'
                                    style='position: relative;width: 48%;padding-right: 15px;max-width: 50%;'>
                                    <!-- Social Links -->
                                    <div id='socialinks' class='card' style='border-radius: 10px !important;box-shadow: 0px 0px 15px rgb(0 0 0 / 10%);margin: 10px auto;padding: 30px;position: relative;flex-direction: column;min-width: 0;word-wrap: break-word;background-color: #fff;background-clip: border-box;border: 1px solid rgba(0,0,0,.125);'>
                                        <h3
                                            style='font-family: Jost, sans-serif;margin-bottom: 15px; font-size: 1.75rem; line-height: 1.2; margin-top: 0;'>
                                          Social Media Profiles</h3>
                                        <ul class='socialinks ul-aside mb-0'
                                            style='font-family: Open Sans, sans-serif;margin-bottom: 0 !important;list-style-type: none;padding: 0;'>
                                            ${this.socialsLinksElements}
                                        </ul>
                                    </div>
                                </div>
                                <div class='col-6'
                                    style='position: relative;width: 48%;padding-right: 15px;max-width: 50%;'>
                                    <!-- Languages -->
                                    <div id='languages' class='card' style='border-radius: 10px !important;box-shadow: 0px 0px 15px rgb(0 0 0 / 10%);margin: 10px auto;padding: 30px;padding-bottom: 20px;position: relative;flex-direction: column;min-width: 0;word-wrap: break-word;background-color: #fff;background-clip: border-box;border: 1px solid rgba(0,0,0,.125);'>
                                        <h3
                                            style='font-family: Jost, sans-serif;margin-bottom: 15px; font-size: 1.75rem; line-height: 1.2; margin-top: 0;'>
                                            Languages</h3>
                                        <div class='rows mx-0' style='display: -ms-flexbox;display: flex;-ms-flex-wrap: wrap;flex-wrap: wrap;margin-right: -15px;margin-left: -15px;margin-right: 0 !important;margin-left: 0 !important;'>
                                            <div
                                                style='position: relative;width: 100%;padding-right: 15px;padding-left: 15px;-ms-flex: 0 0 100%;flex: 0 0 100%;max-width: 100%;'>
                                                <ul class=' ul-aside mb-0 langlist'
                                                    style='font-family: Open Sans, sans-serif;margin-bottom: 0 !important;list-style-type: none;padding: 0;'>
                                                    ${this.languagesElements}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>

                            <div class='row'
                                style='display: -ms-flexbox;display: flex;-ms-flex-wrap: wrap;flex-wrap: wrap;margin-right: -15px;margin-left: -15px;'>
                                <div class='col-6'
                                    style=' position: relative;width: 48%;padding-right: 15px;max-width: 50%;'>
                                    <!-- Skills -->
                                    <div id='skills' class='card'
                                        style='border-radius: 10px !important;box-shadow: 0px 0px 15px rgb(0 0 0 / 10%);margin: 10px auto;padding: 30px;position: relative;flex-direction: column;min-width: 0;word-wrap: break-word;background-color: #fff;background-clip: border-box;border: 1px solid rgba(0,0,0,.125);'>
                                        <h3
                                            style='font-family: Jost, sans-serif;margin-bottom: 15px;font-size: 1.75rem;line-height: 1.2;margin-top: 0;'>
                                            Skills</h3>
                                        <div class='mx-0'>
                                            <div>
                                                <ul class='ul-aside mb-0'
                                                    style='font-family: Open Sans, sans-serif;margin-bottom: 0 !important;list-style-type: none;padding: 0;line-height: 35px;'>
                                                  ${this.skillsElements}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class='col-6'
                                    style='position: relative;width: 48%;padding-right: 30px;padding-left: 0px;max-width: 50%;'>
                                    <!-- Preferences -->
                                    <div id='preferences' class='card'
                                        style='font-family: Open Sans, sans-serif;border-radius: 10px !important;box-shadow: 0px 0px 15px rgb(0 0 0 / 10%);margin: 10px auto;padding: 30px;position: relative;flex-direction: column;min-width: 0;word-wrap: break-word;background-color: #fff;background-clip: border-box;border: 1px solid rgba(0,0,0,.125);'>
                                        <h3
                                            style='font-family: Jost, sans-serif;margin-bottom: 15px;font-size: 1.75rem;line-height: 1.2;margin-top: 0;'>
                                            Preferences</h3>
                                        <div class='preflist row'
                                            style='display: -ms-flexbox;display: flex;-ms-flex-wrap: wrap;flex-wrap: wrap;margin-right: -15px;margin-left: -15px;'>
                                            <div class='col-12'
                                                style='position: relative;width: 100%;padding-right: 15px;padding-left: 15px;-ms-flex: 0 0 100%;flex: 0 0 100%;max-width: 100%;'>
                                                <div class='row'
                                                    style='display: -ms-flexbox;display: flex;-ms-flex-wrap: wrap;flex-wrap: wrap;margin-right: -15px;margin-left: -15px;'>
                                                    <div class='col-6 pref'
                                                        style='position: relative;width: 40%;padding-right: 15px;padding-left: 15px;max-width: 42%;margin-bottom: 25px;'>
                                                        <div class='prefname' style='font-size: 14px; color: #969EB5;'>
                                                            Current Employment Status</div>
                                                        <div class='prefval'>${this.candData.currEmpStatus}</div>
                                                    </div>
                                                    <div class='col-6 pref'
                                                        style='position: relative;width: 40%;padding-right: 15px;padding-left: 15px;max-width: 42%;margin-bottom: 25px;'>
                                                        <div class='prefname' style='font-size: 14px; color: #969EB5;'>
                                                            Availability</div>
                                                        <div class='prefval'>${this.candData.availability}</div>
                                                    </div>
                                                    <div class='col-6 pref'
                                                        style='position: relative;width: 40%;padding-right: 15px;padding-left: 15px;max-width: 42%;margin-bottom: 25px;'>
                                                        <div class='prefname' style='font-size: 14px; color: #969EB5;'>
                                                            Employment Preference</div>
                                                        <div class='prefval'>${this.candData.empPerf}</div>
                                                    </div>
                                                    <div class='col-6 pref'
                                                        style='position: relative;width: 40%;padding-right: 15px;padding-left: 15px;max-width: 42%;margin-bottom: 25px;'>
                                                        <div class='prefname' style='font-size: 14px; color: #969EB5;'>
                                                            Flexibility Preference</div>
                                                        <div class='prefval'>${this.candData.flexibilityPref}</div>
                                                    </div>
                                                    <div class='col-6 pref'
                                                        style='position: relative;width: 40%;padding-right: 15px;padding-left: 15px;max-width: 42%;margin-bottom: 25px;'>
                                                        <div class='prefname' style='font-size: 14px; color: #969EB5;'>
                                                            Compensation Preference</div>
                                                        <div class='prefval'>${this.candData.payRate} /
                                                            ${this.candData.payType}</div>
                                                    </div>
                                                    <div class='col-6 pref'
                                                        style='position: relative;width: 40%;padding-right: 15px;padding-left: 15px;max-width: 42%;margin-bottom: 25px;'>
                                                        <div class='prefname' style='font-size: 14px; color: #969EB5;'>Out
                                                            of Town Travel Preference</div>
                                                        <div class='prefval'>${this.candData.travelPrefMiles} | ${this.candData.travelPrefMiles}</div>
                                                    </div>
                                                    <div class='col-6 pref'
                                                        style='position: relative;width: 40%;padding-right: 15px;padding-left: 15px;max-width: 42%;margin-bottom: 25px;'>
                                                        <div class='prefname' style='font-size: 14px; color: #969EB5;'>
                                                            Relocation Preference</div>
                                                        <div class='prefval'>${this.candData.relocationPref} </div>
                                                    </div>
                                                    <div class='col-6 pref'
                                                        style='position: relative;width: 40%;padding-right: 15px;padding-left: 15px;max-width: 42%;margin-bottom: 25px;'>
                                                        <div class='prefname' style='font-size: 14px; color: #969EB5;'>Role
                                                            Preferences</div>
                                                        <div class='prefval'>
                                                            ${this.candData.empPrefRoleTitle} <br>
                                                            <small> ${this.candData.empPrefLocation} (${this.candData.miles})</small>
                                                        </div>
                                                    </div>
                                                    <div class='col-6 pref mb-0'
                                                        style='position: relative;width: 40%;padding-right: 15px;padding-left: 15px;max-width: 42%;margin-bottom: 25px;'>
                                                        <div class='prefname' style='font-size: 14px; color: #969EB5;'>
                                                            Legally Authorized to Work in US </div>
                                                        <div class='prefval'>${this.candData.legalUS}</div>
                                                    </div>
                                                    <!--  -->
                                                    <div class='col-6 pref mb-0'
                                                        style='position: relative;width: 40%;padding-right: 15px;padding-left: 15px;max-width: 42%;margin-bottom: 25px;'>
                                                        <div class='prefname' style='font-size: 14px; color: #969EB5;'>
                                                            Require Visa Sponsorship</div>
                                                        <div class='prefval'>${this.candData.requireVisa}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    </body>

    </html>`;
    return allEles
      .replace(/(\r\n|\n|\r)/gm, '')
      .replace(/<br>/g, '<br></br>')
      .replace(/&/g, ' ');
  }
}
