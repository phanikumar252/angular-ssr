// import { Injectable } from '@angular/core';

// @Injectable({
//   providedIn: 'root'
// })
// export class HtmlToPdfConvertionService {

//   constructor() { }
// }

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class HtmlToPdfConvertionService {
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
    workingHours: '',
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
    profilePicPath: '',
  };
  empHistoryElements = '';
  educationElements = '';
  skillsElements = '';
  socialsLinksElements = '';
  languagesElements = '';
  certificateElements = '';
  TrainingElements = '';

  avaiStatusBgColor = '';
  avaiStatusBorderColor = '';
  avaiStatusTextColor = '';
  profileImageHtml = '';

  constructor() { }

  ngOnInit() { }

  loadData(obj: any) {
    this.candData = obj;
    console.log(this.candData);

    if (this.candData.availability === 'Available Now') {
      this.avaiStatusBgColor = '#23922e';
      this.avaiStatusBorderColor = '#23922e';
      this.avaiStatusTextColor = '#ffffff';
    } else if (this.candData.availability === 'Available Soon') {
      this.avaiStatusBgColor = '#ffffff';
      this.avaiStatusBorderColor = '#23922e';
      this.avaiStatusTextColor = '#111111';
    } else if (this.candData.availability === 'Passively Looking') {
      this.avaiStatusBgColor = '#de624e';
      this.avaiStatusBorderColor = '#de624e';
      this.avaiStatusTextColor = '#ffffff';
    } else if (this.candData.availability === 'Not Looking') {
      this.avaiStatusBgColor = '#a4b2c8';
      this.avaiStatusBorderColor = '#a4b2c8';
      this.avaiStatusTextColor = '#111111';
    }
    this.profileImageHtml =
      `<li>` +
      `<span class='hire tag' style='background-color: ${this.avaiStatusBgColor};border: 1px solid ${this.avaiStatusBorderColor}; border-radius:1px; color: ${this.avaiStatusTextColor};padding: 5px 15px;` +
      `display: inline-block;` +
      `font-family: Jost, sans-serif; font-weight:bold'><i class='fas fa-circle'></i>${this.candData.availability}</span>` +
      `</li>`;
    console.log(this.profileImageHtml);

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
      this.empHistoryElements += `<li class='innerpadding emprecord'>
          <div class='companydata w100 fl'>
            <h4 class='fl'>${el.jobTitle} | ${el.companyName
        }</h4> <span class='subheading fr'>${el.startDate.substring(0, 4)} - ${el.currentCompany ? 'Present' : el.endDate.substring(0, 4)
        }</span>
          </div>
          <ul class='jobsmry'> ${el.empResponsibilities.replace(
          /\r\n/g,
          '<br>'
        )} </ul>
          
      </li>`;
    });
    this.educationElements = ``;
    this.candData.education.forEach((el: any) => {
      this.educationElements += `<li>
          <div class='companydata'>
              <h4>${el.degreeName} | ${el.degreeType
        } <span class='years float-right'>${el.degreeCompletionDate.substring(
          0,
          4
        )}</span>
              </h4>
              <span class='subheading'>${el.schoolName}</span>
          </div>
      </li>`;
    });
    this.certificateElements = '';
    this.candData.certficationList.forEach((el: any) => {
      this.certificateElements += `<li class='innerpadding'>
          <div class='companydata'>
              <h4>${el.certName
        }<span class='years float-right'>${el.completedYear.substring(
          0,
          4
        )}</span>
              </h4>
              <span class='subheading'>${el.authorityName}</span>
          </div>
      </li>`;
      // certValue: "License"
    });

    this.TrainingElements = '';
    this.candData.trainingList.forEach((el: any) => {
      this.TrainingElements += `<li class='innerpadding'>
          <div class='companydata'>
              <h4>${el.institutionName
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
    console.log('candidate data', this.candData);
    this.candData.skills.forEach((el: any) => {
      this.skillsElements += `
      <tr>
      <td class="skillname">${el.skillName} - ${el.skillValue}</td>
      <td class="skillrating">
        <div class="skillDot ${el.skillLevelID === 10004001 ||
          el.skillLevelID === 10004002 ||
          el.skillLevelID === 10004003 ||
          el.skillLevelID === 10004004
          ? 'blue'
          : 'grey'
        }"></div>
        <div class="skillDot ${el.skillLevelID === 10004002 ||
          el.skillLevelID === 10004003 ||
          el.skillLevelID === 10004004
          ? 'blue'
          : 'grey'
        }"></div>
        <div class="skillDot ${el.skillLevelID === 10004003 || el.skillLevelID === 10004004
          ? 'blue'
          : 'grey'
        }"></div>
        <div class="skillDot ${el.skillLevelID === 10004004 ? 'blue' : 'grey'
        }"></div>
      </td>
  </tr>
          `;
      //     <li>
      //     <span class='skillname'>${el.skillName}</span>
      //     <span class='skillrating float-right' >
      //       ${(el.skillValue) ? ' | ' + el.skillValue : ''}
      //     </span>
      // </li>
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
      this.socialsLinksElements += `<li>
          <i class='fas fa-basketball-ball'></i>
          <a href='${el.socialURL}'>${el.socialURL}</a>
      </li>`;
    });
    this.languagesElements = ``;
    this.candData.languages.forEach((el: any) => {
      this.languagesElements += `<li>
          <span class='skillname'>${el.langName}</span>
          <span class='tag'>${el.langValue}</span>
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
    // debugger;
    const allEles =
      `<!DOCTYPE html>
    <html lang='en'>
    
    <head>
    <style>
    * {
        margin: 0;
        padding: 0;
    }

    .innerpadding {
        padding: 0 0px;
    }

    .skillDot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        float: left;
        margin-left: 2px;
    }

    .grey {
        background-color: #969eb5;
    }

    .blue {
        background-color: #0052CC;
    }

    .w60 {
        width: 65%
    }

    .w40 {
        width: 33%
    }

    .max-w100 {
        min-width: 65% !important;
        max-width: 100% !important;
    }

    .w100 {
        width: 100%
    }

    .w80 {
        width: 80%
    }

    .card {
        border-radius: 10px !important;
        margin: 10px auto;
        position: relative;
        flex-direction: column;
        min-width: 0;
        word-wrap: break-word;
        background-color: #fff;
        background-clip: border-box;
        border: 1px solid rgba(0, 0, 0, .125);
        padding: 10px;
        box-shadow: 0px 0px 15px rgb(0 0 0 / 10%);
    }

    hr {
        margin-top: 1rem;
        margin-bottom: 1rem;
        border: 0;
        border-top-color: currentcolor;
        border-top-style: none;
        border-top-width: 0px;
        border-top: 1px solid rgba(0, 0, 0, .1);
        height: 0;
        overflow: visible;
    }

    a {
        color: #111111;
        text-decoration: none;
        display: inline-block;
        margin-left: 10px;
        font-family: Open Sans, sans-serif;
        list-style-type: none;
    }

    .mt-30 {
        margin-top: 30px;
    }

    .jobsmry {
        margin: 10px 25px;
        margin-bottom: 10px;
        text-align: justify;
    }

    h4 {
        font-family: Jost, sans-serif;
        font-weight: bold;
        font-size: 18px;
        margin-bottom: 5px;
    }

    .skillname {
        width: 70%
    }

    .subheading {
        color: #969EB5;
    }

    td {
        line-height: 30px;
        margin: 0;
        padding: 0
    }

    ul,
    td {
        font-family: Open Sans, sans-serif;
        list-style-type: none;
    }

    .bb {
        border: 0px solid #AAA
    }

    .fl {
        float: left !important
    }

    .float-right,
    .fr {
        float: right !important
    }

    .mx-0 {
        margin-right: 0 !important;
        margin-left: 0 !important;
    }

    .years {
        font-size: 16px;
        color: #969EB5;
        font-weight: normal;
    }

    .tag {
        color: #777981;
        border: 1px solid #D8DDE8;
        border-radius: 10px;
        font-size: 14px;
        padding: 0px 15px;
        line-height: 22px;
        margin: 5px 0px;
        height: 25px;
        overflow: hidden;
    }

    h3 {
        font-family: Jost, sans-serif;
        margin-bottom: 15px;
        font-size: 1.75rem;
        line-height: 1.2;
        margin-top: 0;
    }

    li {
        line-height: 30px;
    }

    ul {
        font-family: Open Sans, sans-serif;
        list-style-type: none;
    }

    p {
        line-height: 25px;
        margin-top: 0;
        margin-bottom: 1rem;
        font-family: Open Sans, sans-serif;
        font-size: 14px;
        text-align: justify;
    }

    .row {
        display: -ms-flexbox;
        display: flex;
        flex-direction: column;
        flex-wrap: wrap;
        margin-right: -15px;
        margin-left: -7px;
    }

    .prefname {
        font-size: 14px;
        color: #969EB5;
        font-family: Open Sans, sans-serif;
    }

    .prefval{
        font-size: 13px;
        font-family: Open Sans, sans-serif;
    }

    .emplist{
        font-family: Open Sans, sans-serif;
        font-size: 14px;
    }

    section {
        margin-bottom: 30px;
        margin-top: 30px;
    }

    .pref {
        position: relative !important;
        padding-right: 15px !important;
        padding-left: 15px !important;
        margin-bottom: 25px !important;
    }

    .group:after {
        content: '';
        display: table;
        clear: both;
    }
    </style>
    </head>
    <body style='padding: 0 5px;background-color: #f3f5f7;'>
      <div class='bb fl card w100' style='margin: 5px auto;padding: 10px; overflow: hidden; width: 97%;'>
      <div class='fl' style='width: 30mm; height: 30mm;   border: 1px solid #D1D5E1; overflow: hidden; border-radius: 50%;      text-align: center;
      background-image: url(${this.candData.profilePicPath}); background-position: center; background-size: cover; '>
           </div>
           <div class='w60' style='padding-right: 15px;padding-left: 15px;margin: 40px 0 0 10px;display: inline-block;width: 45%;'>
               <h2 style='font-family: Jost, sans-serif; margin-bottom: 0;text-transform: capitalize;' >
               ${this.candData.firstName} ${this.candData.lastName} </h2>
               <ul class='mb-0'>
                   <li style="text-transform: capitalize;">
                       <i class='fa fa-briefcase'></i>${this.candData.jobTitle}
                   </li>
                   <li><i class='fa fa-map-marker-alt'></i> ${this.candData.cityName}, ${this.candData.stateName}</li>

                   ` +
      (this.candData.availability
        ? `
                   ${this.profileImageHtml}`
        : '') +
      `

                   

               </ul>
           </div>
           <div class='w40' style='display: inline-block;position: relative;top: -70px;'>
               <p style='line-height: 0;text-align: right;'>+1 ${this.candData.phoneNo}</p>
               <p style='line-height: 0;text-align: right;'><a href='${this.candData.email}'>${this.candData.email}</a></p>
           </div>
      </div>
      <div class='left-sec fl w60'>
        
      ` +
      (this.candData.careersummary
        ? `
        <div class='bb card' style='margin: 10px auto 0 5px; overflow: hidden; '>
          <h3>Professional Summary</h3>
          <p>
              ${this.candData.careersummary}
          </p>
        </div>`
        : '') +
      `
        
        ` +
      (this.candData.empHistory.length
        ? `
        <div class='bb card' style='margin: 10px auto 10px 5px; overflow: hidden; '>
            <section id='emphistory'>
                <h3 class='innerpadding'>Employment History</h3>
                <ul class='emplist'> ${this.empHistoryElements}
                </ul>
            </section>
        </div>`
        : '') +
      `
        ` +
      (this.candData.education.length
        ? `
        <div class='bb card' style='margin: 10px auto 0 5px; overflow: hidden; '>
            <section id='edu'>
                <h3 class='innerpadding'> Education </h3>
                <ul class='stripe'>${this.educationElements}
                </ul>
            </section>
        </div>`
        : '') +
      `

        
        ` +
      (this.candData.certficationList.length
        ? `
        <div class='bb card' style='margin: 10px auto 0 5px; overflow: hidden; '>
            <section id='Certifications'>
                <h3 class='innerpadding'>License & Certification</h3>
                <ul class='stripe'>${this.certificateElements}
                </ul>
            </section>
        </div>`
        : '') +
      `

        
        ` +
      (this.candData.trainingList.length
        ? `
        <div class='bb card' style='margin: 10px auto 0 5px; overflow: hidden; '>
            <section id='training'>
                <h3 class='innerpadding'> Training</h3>
                <ul class='stripe'>${this.TrainingElements}
                </ul>
            </section>
        </div>`
        : '') +
      `


      </div>
      <div class='right-sec  fr w40'>
        ` +
      (this.candData.socialsLinks.length
        ? `
        <div class='bb card' style='margin: 10px auto 0;  overflow: hidden;  '>
            <h3>Social Media Profiles </h3>
            <div class='rows mx-0'>
                <div>
                    <ul class='ul-aside mb-0 langlist'>${this.socialsLinksElements}
                    </ul>
                </div>
            </div>
        </div>`
        : '') +
      `
        ` +
      (this.candData.languages.length
        ? `
        <div class='bb card' style='margin: 10px auto 0;  overflow: hidden; '>
            <h3>Languages</h3>
            <div class='rows mx-0'>
                <div>
                    <ul class='ul-aside mb-0 langlist'>
                    ${this.languagesElements}
                    </ul>
                </div>
            </div>
        </div>`
        : '') +
      `

        ` +
      (this.candData.skills.length
        ? `
        <div class='bb card' style='margin: 10px auto 0; overflow: hidden; '>
            <h3>Skills</h3>
            <div class='mx-0 fl'>
                <div class='fl' style='width:100%'>
                    <table>
                    ${this.skillsElements}
                    </table>
                </div>
            </div>
        </div>`
        : '') +
      `
        <div class='bb card' style='margin: 10px auto 0; overflow: hidden; '>
            <h3>Preferences</h3>
            <div class='preflist row'>
                <div class='col-12'>
                    <div class='row'>
                    <div class='col-6 pref'>
                        <div class='prefname'>
                            Current Employment Status</div>
                        <div class='prefval'>${this.candData.currEmpStatus}</div>
                    </div>
                    <div class='col-6 pref'>
                        <div class='prefname'>Availability</div>
                        <div class='prefval'>${this.candData.availability}</div>
                    </div>
                    <div class='col-6 pref'>
                        <div class='prefname'>Employment Preference</div>
                        <div class='prefval'>${this.candData.empPerf}</div>
                    </div>
                    <div class='col-6 pref'>
                        <div class='prefname'>Flexibility Preference</div>
                        <div class='prefval'>${this.candData.flexibilityPref}</div>
                    </div>
                    <div class='col-6 pref'>
                        <div class='prefname'>Preferred working hours</div>
                        <div class='prefval'>${this.candData.workingHours}</div>
                    </div>
                    <div class='col-6 pref'>
                        <div class='prefname'>Compensation Preference</div>
                        <div class='prefval'>$${this.candData.compensationPref} per Year /
                            $${this.candData.empHourCompensation} per Hour </div>
                    </div>
                    <div class='col-6 pref'>
                        <div class='prefname'>Legally Authorized to Work in US</div>
                        <div class='prefval'>${this.candData.legalUS}</div>
                    </div>
                    <div class='col-6 pref'>
                        <div class='prefname'>Require Visa Sponsorship</div>
                        <div class='prefval'>${this.candData.requireVisa}</div>
                    </div>
                    </div>
                </div>
            </div>
        </div>


      </div>
    </body>

    </html>`;
    console.log(allEles);
    return allEles
      .replace(/(\r\n|\n|\r)/gm, '')
      .replace(/<br>/g, '<br></br>')
      .replace(/&/g, ' ');
  }
}
// <div class='mx-0'>
//                                             <div>
//                                                 <ul class='ul-aside mb-0'>

//                                                 </ul>
//                                             </div>
//                                         </div>
