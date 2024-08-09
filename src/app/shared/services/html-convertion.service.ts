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
            this.empHistoryElements += `<li class='innerpadding emprecord'>
          <div class='companydata'>
              <h4>${el.jobTitle} | ${el.companyName}</h4>
              <span class='subheading'>${el.startDate.substring(0, 4)} - ${el.currentCompany ? 'Present' : el.endDate.substring(0, 4)
                } |
                  ${el.workAddress}</span>
          </div>
          <ul class='jobsmry'>
              ${el.empResponsibilities.replace(/\r\n/g, '<br>')}
          </ul>
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
        this.candData.skills.forEach((el: any) => {
            this.skillsElements += `<li>
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
        const allEles = `<!DOCTYPE html>
    <html lang='en'>
    <head>
    <style>
        #wrapper{
            margin: 0px auto;max-width: 98%;overflow: hidden;
        }
        #pdfheader{
            margin-bottom: 15px; margin-top: 30px;
        }
        .container{
            width: 100%;max-width: 1140px;padding-right: 15px;padding-left: 15px;margin-right: auto;margin-left: auto; 
        }
        .card{
            border-radius: 10px !important;box-shadow: 0px 0px 15px rgb(0 0 0 / 10%);margin: 10px auto;padding: 30px;position: relative;flex-direction: column;min-width: 0;word-wrap: break-word;background-color: #fff;background-clip: border-box;border: 1px solid rgba(0,0,0,.125);       }
        .row{
            display: -ms-flexbox;display: flex;-ms-flex-wrap: wrap;flex-wrap: wrap;margin-right: -15px;margin-left: -15px;
        }
        .col-6{
            position: relative;width: 48%;padding-right: 15px;padding-left: 15px;max-width: 50%;
        }
        .d-flex{
            display: -ms-flexbox !important;display: flex !important;
        }
        .align-items-center{
            -ms-flex-align: center !important;align-items: center !important;
        }
        .col-4{position: relative;padding-right: 15px;padding-left: 15px;max-width: 33.333333%;}
        .avatar{
            width: 150px;height: 150px;min-width: 120px;min-height: 120px;border: 1px solid #D1D5E1;overflow: hidden;border-radius: 100%;margin: 0 auto;text-align:center
        }
        .col-8{
            position: relative;padding-right: 15px;padding-left: 15px;max-width: 66.666667%;
        }
        h2{
            font-family: Jost, sans-serif;margin-bottom:0
        }
        ul{
            font-family: Open Sans, sans-serif;margin-bottom: 0 !important;margin-top: 0;list-style-type: none;padding: 0;
        }
        li{
            line-height: 30px;
        }
        .hire.tag{
            background-color: #E5F9E7;border: none;color: #111;padding: 5px 15px;margin-top: 5px;display: inline-block;line-height: 15px;
        }
        .justify-content-end{
            -ms-flex-pack: end !important;justify-content: flex-end !important;
        }
        .text-right{
            text-align: right !important;
        }
        a{
            color:#111111;text-decoration:none;display:inline-block;margin-left: 10px;
        }
        #pdfbody{
            margin-top: 15px; margin-bottom: 15px;
        }
        .container{
            width: 100%;max-width: 1140px;padding-right: 15px;padding-left: 15px;margin-right: auto;margin-left: auto;
        }
        .col-12{
            position: relative;width: 100%;padding-right: 15px;padding-left: 15px;-ms-flex: 0 0 100%;flex: 0 0 100%;max-width: 100%;
        }
        .px-0{
            padding-right: 0 !important;padding-left: 0 !important;
        }
        .innerpadding{
            padding: 0 30px;
        }
        .mt-0{
            margin-top: 0!important;
        }
        #smry{
            margin-bottom: 30px;margin-top: 30px;
        }
        h3{
            font-family: Jost, sans-serif; margin-bottom: 15px; font-size: 1.75rem; line-height: 1.2; margin-top: 0;
        }
        p{
            line-height: 30px;margin-top: 0;margin-bottom: 1rem; font-family: Open Sans, sans-serif;
        }
        hr{
            margin-top: 1rem;margin-bottom: 1rem;border: 0;border-top: 1px solid rgba(0,0,0,.1);height: 0;overflow: visible;
        }
        section{
            margin-bottom: 30px;margin-top: 30px;
        }
        .mx-0{
            margin-right: 0 !important;margin-left: 0 !important;
        }
        .col-6.pref{
            position: relative !important; width: 40% !important; padding-right: 15px !important; padding-left: 15px !important; max-width: 42% !important; margin-bottom: 25px !important; 
        }
        .emplist{
            font-family: Open Sans, sans-serif;
            font-size: 14px;
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
        .emprecord{
            padding: 0 30px;
        }
        h4{
            font-family: Jost, sans-serif;font-weight: normal;font-size: 22px;margin-bottom: 5px;
        }
        .subheading{
            color: #969EB5;
        }
        .jobsmry{
            margin: 10px 25px;
        }
        .float-right{
            float: right!important;
        }
        .years{
            font-size: 16px;color: #969EB5;font-weight: normal;
        }
        .socialinks li{
            line-height: 30px; margin-top: 5px; line-height: 35px; 
        }
        .socialinks a{
            color:#111111;text-decoration:none;display:inline-block;margin-left: 10px;
        }
        .langlist li{
            line-height: 30px; display: flex; justify-content: space-between;
        }
        .langlist .tag{
            color: #777981;border: 1px solid #D8DDE8;border-radius: 30px;font-size: 14px;padding: 0px 15px;line-height: 22px;margin: 5px 0px;height: 25px;overflow: hidden;
        }
        .companydata {
            margin-left: 30px;
        }
        .prefname{
            font-size: 14px; color: #969EB5;
        }
    </style>
    </head>
    <body>
        <div id='wrapper'>
            <section id='pdfheader'>
                <div class='container card'>
                    <div class='row'>
                        <div class='col-6'>
                            <div class='row d-flex align-items-center'>
                                <div class='col-4'>
                                    <div class='avatar'>
                                        <img src='assets/images/avatar.png' alt=''></img>
                                    </div>
                                </div>
                                <div class='col-8'>
                                    <div class='candata'>
                                        <h2 style="text-transform: capitalize;">${this.candData.firstName} ${this.candData.lastName}
                                        </h2>
                                        <ul class='mb-0'>
                                            <li style="text-transform: capitalize;">
                                                <i class='fa fa-briefcase'></i>${this.candData.jobTitle}
                                            </li>
                                            <li><i class='fa fa-map-marker-alt'></i> ${this.candData.cityName}, ${this.candData.stateName}</li>
                                            <li>
                                                <span class='hire tag'><i class='fas fa-circle'></i> Available for
                                                    Hire</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class='col-6 d-flex align-items-center justify-content-end text-right'>
                            <ul class='contactinfo'>
                                <li> <i class='fa fa-mobile'></i>
                                    <a href='tel:+917566610101'>+1 ${this.candData.phoneNo}</a>
                                </li>
                                <li> <i class='fa fa-envelope'></i> <a href='${this.candData.email}'>
                                        ${this.candData.email}</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>
            <section id='pdfbody'>
                <div class='container'>
                    <div class='row'>
                        <!-- Left Section -->
                        <div class='col-12 card px-0'>
                            <div>
                                <!-- Career Summary -->
                                <section id='smry' class='innerpadding mt-0'>
                                    <h3>
                                    Professional Summary</h3>
                                    <p>
                                        ${this.candData.careersummary}
                                    </p>
                                </section>
                                <hr>
                                </hr>
                                <!-- Employment History -->
                                <section id='emphistory'>
                                    <h3 class='innerpadding'> Employment History</h3>
                                    <ul class='emplist'>
                                        ${this.empHistoryElements}
                                    </ul>
                                </section>
                                <hr>
                                </hr>
                                <!-- Education -->
                                <section id='edu'>
                                    <h3 class='innerpadding'>
                                        Education
                                    </h3>
                                    <ul class='stripe'>
                                        ${this.educationElements}
                                    </ul>
                                </section>
                                <hr>
                                </hr>
                                <!-- Certification -->
                                <section id='certifications'>
                                    <h3 class='innerpadding'>
                                        License & Certification</h3>
                                    <ul class='stripe'>
                                        ${this.certificateElements}
                                    </ul>
                                </section>
                                <!-- Training -->
                                <section id='training'>
                                    <h3 class='innerpadding'>
                                        Training</h3>
                                    <ul class='stripe'>
                                        ${this.TrainingElements}
                                    </ul>
                                </section>
                                <hr>
                                </hr>
                            </div>
                        </div>
                        <!-- Right Sidebar -->
                        <div class='col-12 px-0 aside'>
                            <div class='row'>
                                <div class='col-6'>
                                    <!-- Social Links -->
                                    <div id='socialinks' class='card'>
                                        <h3> Social Media Profiles</h3>
                                        <ul class='socialinks ul-aside mb-0'>
                                            ${this.socialsLinksElements}
                                        </ul>
                                    </div>
                                </div>
                                <div class='col-6'>
                                    <!-- Languages -->
                                    <div id='languages' class='card'>
                                        <h3>
                                            Languages</h3>
                                        <div class='rows mx-0'>
                                            <div>
                                                <ul class='ul-aside mb-0 langlist'>
                                                    ${this.languagesElements}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>

                            <div class='row'>
                                <div class='col-6'>
                                    <!-- Skills -->
                                    <div id='skills' class='card'>
                                        <h3>
                                            Skills</h3>
                                        <div class='mx-0'>
                                            <div>
                                                <ul class='ul-aside mb-0'>
                                                    ${this.skillsElements}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class='col-6'>
                                    <!-- Preferences -->
                                    <div id='preferences' class='card'>
                                        <h3>
                                            Preferences</h3>
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
                                                        <div class='prefname'>Compensation Preference</div>
                                                        <div class='prefval'>${this.candData.compensationPref} per Year /
                                                            ${this.candData.empHourCompensation} per Hour </div>
                                                    </div>
                                                   
                                                   
                                                    <div class='col-6 pref mb-0'>
                                                        <div class='prefname'>Legally Authorized to Work in US </div>
                                                        <div class='prefval'>${this.candData.legalUS}</div>
                                                    </div>
                                                    <!--  -->
                                                    <div class='col-6 pref mb-0'>
                                                        <div class='prefname'>Require Visa Sponsorship</div>
                                                        <div class='prefval'>
                                                            ${this.candData.requireVisa}
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
