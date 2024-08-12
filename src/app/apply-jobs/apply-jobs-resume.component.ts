import {
  Component,
  ElementRef,
  OnInit,
  Renderer2,
  ViewChild,
  AfterViewInit,
  Inject,
  PLATFORM_ID,
  Injector
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Emitters } from '../class/emitters/emitters';

import { AuditlogService } from '../shared/auditlog.service';
import { RemoveJunkTextService } from '../shared/services/remove-junk-text.service';
import { environment } from 'src/environments/environment';
import { UserAuthService } from '../user-auth.service';
import { FilterPipe } from '../pipes/filter.pipe';

import { AssessmentCountService } from '../shared/services/assessment-count.service';


import { VerifyEmailAccountComponent } from '../common-component/modals/verify-email-account/verify-email-account.component';
import { SharedService } from '../shared.service';
import { Location, isPlatformBrowser } from '@angular/common';
import * as moment from 'moment';
import { TransferState, makeStateKey, Meta, Title } from '@angular/platform-browser';

export interface Job {

  jobtitle: string;
  compname: string;
  city: string;
  state: string;
  date: string;
  description: string;
  descShort: string;
  payrange: string;
  payrange1: Number | string;
  payrange2: Number | string;
  paytype: string;
  applied: Boolean;
  jobid: number;
}
export interface JobType {
  lookupId: number;
  lookupScreenDesc: string;
  lookupValue: string;
}
export interface AssessmentRequired {
  id: number;
  name: string;
}
export interface AppliedJob {
  accuickJobId: number;
  city: string;
  clientName: string;
  jobTitle: string;
  state: string;
  userId: number;
  userJobId: number;
  zipcode: string;
  isChecked: Boolean;
  payrange: string;
  payrange1: Number | string;
  payrange2: Number | string;
  payRate: string;
  paytype: string;
  jobType: string;
  description: string;
  appliedDate: string;
}

@Component({
  selector: 'app-apply-jobs-resume',
  templateUrl: './apply-jobs-resume.component.html',
  styleUrls: ['./apply-jobs-resume.component.css'],
})
export class ApplyJobsResumeComponent implements OnInit, AfterViewInit {
  private isBrowser: boolean = true;
  isSubmit: boolean = false;
  isBmsUrl: any;
  isElevanceUrl: any;
  isEmailFocused: boolean = false;
  jobsTab = true;
  jobForm: FormGroup;
  jobsList: Job[] = [];
  jobtypes: JobType[] = [];
  jobsAppliedList: AppliedJob[] = [];
  myRequiredAssessments: AssessmentRequired[] = [];
  file: File[] = [];
  fileExt = '';
  selectedJob: any;
  jobData: any;
  showSpinner = false;
  searched = false;
  selectedIndex: number = 0;
  errorTxt = 'No Recommended Jobs Found';
  isMobile = false;
  filtersHide = true;
  jobIdFromMail = null;
  isUserGuestFromResume = false;
  auditObj = {
    actionId: '',
    userId: '',
    jsonData: '',
  };
  assessmentsAry: any;
  badgesPath: any;
  jobIdToLoad = '';
  keyWordData = '';
  loginForm: any;
  submitted = false;
  hide = true;
  color = 'accent';
  emailId: any;
  redirectTo: any;
  jsonData = {
    buttonColor: '',
    brandColorColor: '',
  };

  logoUrl = environment.baseUrl + 'candidates';
  emailEmpty = false;
  firstNameEmpty = false;
  lastNameEmpty = false;
  isAlreadyOldUser = false;
  color1 = 'primary';

  jobTypesList123 = [
    '',
    'Full Time',
    'Part Time',
    'Contract',
    'Contract To Hire',
    'Temporary',
    'Intership',
    'Volunteer',
  ];

  jobTypesList = [
    '',
    'Permanent',
    'Contract/Temporary',
    'Contract To Hire',
    'Freelance',
  ];

  workTypeList = ['', 'Remote', 'Hybrid', 'On-site'];
  highVolume: Boolean = false;

  showMore: any;
  HideSummary: any;
  isMobileHeight: any;
  policyList: any[] = [];
  private META_TITLE_KEY = makeStateKey<string>('meta-title');
  @ViewChild('native') native: { nativeElement: any } | undefined;
  // @ViewChild("fileInput") fileField: {ElementRef:any} | undefined;
  @ViewChild('phoneNo') phoneNo: ElementRef | undefined;
  @ViewChild('fileInput') fileInput: ElementRef | undefined;
  @ViewChild('firstName') firstName: ElementRef | undefined;
  @ViewChild('lastName') lastName: ElementRef | undefined;
  @ViewChild('email') email: ElementRef | undefined;
  @ViewChild('submitButton') submitButton: ElementRef | undefined;
  @ViewChild('terms') terms: ElementRef | undefined;
  // fileField:{ElementRef:any} | undefined;

  constructor(
    public dialog: MatDialog,
    private sharedService: SharedService,
    private formBuild: FormBuilder,
    private userService: UserAuthService,
    private auditlogService: AuditlogService,
    private toastr: ToastrService,
    // public rj: RemoveJunkTextService,
    private router: Router,
    private actRoute: ActivatedRoute,
    private countChange: AssessmentCountService,
    private el: ElementRef,
    private location: Location,
    private render: Renderer2,
    @Inject(PLATFORM_ID) private platformId: Object,
    private meta: Meta,
    private titleService: Title,
    private injector: Injector,
    private transferState: TransferState
  ) {
    // if(this.actRoute.snapshot.params.id){
    //   this.jobIdFromMail = this.actRoute.snapshot.params.id;
    //   localStorage.setItem('mailJobId', this.actRoute.snapshot.params.id);
    // }
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.badgesPath = environment.badgesPath;
    this.jobForm = formBuild.group({
      // candname: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(50)]],
      // status: ['', Validators.required],
      keyWords: [''],
      location: [''],
      jobType: [''],
      hours: [''],
      payRate: [''],
    });
  }

  private get rj() {
    return this.injector.get(RemoveJunkTextService);
  }
  getJobs(type: any) {
    this.errorTxt = 'No Jobs Found';
    this.searched = false;
    this.selectedJob = '';
    this.jobsList = [];

    if (type == 'keyWords') {
      this.staticAuditLogAPI('104', '');
    }
    if (type == 'location') {
      this.staticAuditLogAPI('105', '');
    }
    if (type == 'jobtype') {
      this.staticAuditLogAPI('106', '');
    }
    if (type == 'payrate') {
      this.staticAuditLogAPI('107', '');
    }

    let dataToPass = {
      keyWords: this.jobForm.value.keyWords,
      location:
        this.jobForm.value.location != '0' ? this.jobForm.value.location : '',
      jobType:
        this.jobForm.value.jobType != '0' ? this.jobForm.value.jobType : '',
      hours: this.jobForm.value.hours != '0' ? this.jobForm.value.hours : '',
      payRate:
        this.jobForm.value.payRate != '0' ? this.jobForm.value.payRate : '',
      next: '0',
      userId: Number(this.userService.getUserId()),
    };
    this.showSpinner = true;
    this.userService.getJobsSearchList(dataToPass).subscribe(
      (response: any) => {
        this.showSpinner = false;
        if (response && response.Status == 401) {
          this.toastr.error(response.Message);
        }
        if (response && response.Match.length) {
          console.log(response);

          this.searched = true;
          if (response.Match.length) {
            // const tobeSelJob = this.jobIdToLoad;
            // response.Match.forEach(function (item: any, i: number) {
            //   if (item.jobid == tobeSelJob) {
            //     response.Match.splice(i, 1);
            //     response.Match.unshift(item);
            //   }
            // });
            response.Match.forEach((el: any) => {
              el.applied = false;
              el.date = this.userService.getDateFormat(el.date);
              el.description = this.rj.removeJunk(el.description);
              el.descShort = this.rj.removeJunk(
                el.description.replace(/\r\n/g, ' ').replace(/<br \/>/g, ' ')
              );
              el.payrange1 = el.payrange;
              // if (el.payrange.includes('-')) {
              //   if (el.payrange.split('-')[0]) {
              //     el.payrange1 = parseFloat(el.payrange.split('-')[0]).toFixed(
              //       2
              //     );
              //     el.payrange1 = el.payrange1 != '0.00' ? el.payrange1 : '';
              //   }
              //   if (el.payrange.split('-')[1]) {
              //     el.payrange2 = parseFloat(el.payrange.split('-')[1]).toFixed(
              //       2
              //     );
              //     el.payrange2 = el.payrange2 != '0.00' ? el.payrange2 : '';
              //   }
              //   el.payrange = '';
              // }
            });
            this.selectedIndex = 0;
            this.selectedJob = response.Match[0];

            this.jobsAppliedList.forEach((jobApp) => {
              response.Match.forEach((el: any) => {
                if (jobApp.accuickJobId == Number(el.jobid)) {
                  el.applied = true;
                }
              });
            });
          }
          this.jobsList = response.Match;
        } else {
          this.jobsList = response.Match;
        }
      },
      (error) => { }
    );
  }

  goToResumeBuilder() {
    if (this.isBrowser) {
      localStorage.setItem('isUploadResumeStatus', 'null');
    }
    this.router.navigate(['/resume-builder']);
  }
  deleteFile() {
    this.file = [];

    this.loginForm.patchValue({
      file: '',
    });
    if (this.file && this.file.length) {
      this.loginForm.get('file').clearValidators(); // 5.Set Required Validator
      this.loginForm.get('file').updateValueAndValidity();
    } else {
      this.loginForm.get('file').setValidators([Validators.required]); // 5.Set Required Validator
      this.loginForm.get('file').updateValueAndValidity();
    }
  }

  onSelectFile(event: any, element: any) {
    console.log(event);

    // console.log(this.selectedJob);
    // return;

    // this.showSpinner = true;
    //  if (confirm("Are you sure want to replace file? ")) {
    const allowedExts = ['pdf', 'doc', 'docx'];
    const file = event.target.files[0];

    const name = file.name;
    const ext = name.substr(name.lastIndexOf('.') + 1).toLowerCase();
    const allowed = allowedExts.some((e) => e === ext);
    if (!allowed) {
      this.toastr.error(`File Extension ".${ext}" is not allowed.`);

      this.loginForm.patchValue({
        file: '',
      });
      if (this.file && this.file.length) {
        this.loginForm.get('file').clearValidators(); // 5.Set Required Validator
        this.loginForm.get('file').updateValueAndValidity();
      } else {
        this.loginForm.get('file').setValidators([Validators.required]); // 5.Set Required Validator
        this.loginForm.get('file').updateValueAndValidity();
      }
      return;
    }
    if (file.size > 2097152) {
      // 1,048,576
      this.toastr.error(`File Size shouldn't exceed 2MB.`);

      this.loginForm.patchValue({
        file: '',
      });
      if (this.file && this.file.length) {
        this.loginForm.get('file').clearValidators(); // 5.Set Required Validator
        this.loginForm.get('file').updateValueAndValidity();
      } else {
        this.loginForm.get('file').setValidators([Validators.required]); // 5.Set Required Validator
        this.loginForm.get('file').updateValueAndValidity();
      }
      return;
    }
    this.file.length = 0;
    this.file.push(...event.target.files);
    console.log(this.file);
    this.fileExt = ext;
    this.userService.resume.push(...event.target.files);
    if (this.file && this.file.length) {
      this.loginForm.get('file').clearValidators(); // 5.Set Required Validator
      this.loginForm.get('file').updateValueAndValidity();
    } else {
      this.loginForm.get('file').setValidators([Validators.required]); // 5.Set Required Validator
      this.loginForm.get('file').updateValueAndValidity();
    }
    //let formData = new FormData();
    //let userId: any = localStorage.getItem('userId');

    // let payrate = '';
    // if (this.selectedJob.payrate) {
    //   payrate = this.selectedJob.payrate;
    // } else {
    //   if (this.selectedJob.payrange1) {
    //     payrate = this.selectedJob.payrange1;
    //   }
    //   if (this.selectedJob.payrange2) {
    //     payrate += this.selectedJob.payrange2;
    //   }
    // }

    // formData.append("userId", userId);
    // formData.append('resume', this.file[0]);
    // formData.append(
    //   'source',
    //   localStorage.getItem('source') || '{}'
    //     ? localStorage.getItem('source') || '{}'
    //     : 'cxninja'
    // );
    // formData.append('sourceLookupId', '10002002');
    // formData.append('communityId', '1000');
    // formData.append(
    //   'status',
    //   this.auditlogService.encryptAES(this.selectedJob.status)
    // );
    // formData.append('accuickJobId', this.selectedJob.jobid);
    // formData.append(
    //   'jobTitle',
    //   this.auditlogService.encryptAES(this.selectedJob.jobtitle)
    // );
    // formData.append(
    //   'clientName',
    //   this.auditlogService.encryptAES(this.selectedJob.compname)
    // );
    // formData.append(
    //   'city',
    //   this.auditlogService.encryptAES(this.selectedJob.city)
    // );
    // formData.append(
    //   'state',
    //   this.auditlogService.encryptAES(this.selectedJob.state)
    // );
    // formData.append(
    //   'zipcode',
    //   this.auditlogService.encryptAES(this.selectedJob.zipcode)
    // );
    // formData.append('payRate', this.auditlogService.encryptAES(payrate));
    // formData.append(
    //   'jobType',
    //   this.auditlogService.encryptAES(this.selectedJob.jobtype)
    // );
    // formData.append(
    //   'description',
    //   this.auditlogService.encryptAES(this.selectedJob.description)
    // );

    //this.showSpinner = true;
    // let fileobj: any = {
    //   filename: name,
    //   extension: ext,
    //   size: file.size,
    // };

    // this.staticAuditLogAPI('99', JSON.stringify(fileobj));

    // this.userService.applyjobexternalsites(formData).subscribe(
    //   (response) => {
    //     console.log(response);
    //     this.showSpinner = false;
    //     if (response.Success) {
    //       localStorage.removeItem('source');
    //       // this.toastr.success(response.Message);
    //       if (response && response.Status) {
    //         if (response.jobAlreadyApplied) {
    //           this.router.navigate(['/already-applied']);
    //         } else {
    //           localStorage.setItem('firstName', response.firstName);
    //           localStorage.setItem('lastName', response.lastName);
    //           localStorage.setItem('email', response.email);
    //           this.router.navigate(['/thanks-for-applying']);
    //         }
    //       }
    //       // this.getreviewdetails();
    //     } else {
    //       //this.toastr.error(response.Message);
    //       if (response.basicInfo) {
    //         if (response.email.trim() == '') {
    //           this.emailEmpty = true;
    //         }
    //         if (response.firstName.trim() == '') {
    //           this.firstNameEmpty = true;
    //         }
    //         if (response.lastName.trim() == '') {
    //           this.lastNameEmpty = true;
    //         }
    //         const dialogRef = this.dialog.open(BasicInfoNotFoundComponent, {
    //           width: '100%',
    //           maxWidth: '100%',
    //           height: '100%',
    //           maxHeight: '100%',
    //           data: {
    //             resume: this.file[0],
    //             emailEmpty: this.emailEmpty,
    //             firstNameEmpty: this.firstNameEmpty,
    //             lastNameEmpty: this.lastNameEmpty,
    //             firstName: response.firstName.trim(),
    //             lastName: response.lastName.trim(),
    //             email: response.email.trim(),
    //           },
    //           // hasBackdrop: false,
    //         });

    //         dialogRef.afterClosed().subscribe((result: { status: Boolean }) => {
    //           if (result) {
    //             // this.jobsList[i].applied = result.status;
    //           }
    //           console.log(result);
    //         });
    //       }
    //     }
    //   },
    //   (error) => {}
    // );
    //}
  }

  loginApplyJob() {
    let payrate = '';
    if (this.selectedJob.payrate) {
      payrate = this.selectedJob.payrate;
    } else {
      payrate = this.selectedJob.payrange;
      // if (this.selectedJob.payrange1) {
      //   payrate = this.selectedJob.payrange1;
      // }
      // if (this.selectedJob.payrange2) {
      //   payrate += this.selectedJob.payrange2;
      // }
    }
    let dataToPass = {
      accuickJobId: this.selectedJob.jobid,
      userId: Number(this.userService.getUserId()),
      jobTitle: this.auditlogService.encryptAES(this.selectedJob.jobtitle),
      clientName: this.auditlogService.encryptAES(this.selectedJob.compname),
      city: this.auditlogService.encryptAES(this.selectedJob.city),
      state: this.auditlogService.encryptAES(this.selectedJob.state),
      zipcode: this.auditlogService.encryptAES(this.selectedJob.zipcode),
      payRate: this.auditlogService.encryptAES(payrate),
      jobType: this.auditlogService.encryptAES(this.selectedJob.jobtype),
      description: this.auditlogService.encryptAES(
        this.selectedJob.description
      ),
      source:
        this.isBrowser ? localStorage.getItem('source') || 'curately'
          ? localStorage.getItem('source') || 'curately'
          : 'curately' : "curately",
    };
    this.showSpinner = true;

    this.userService.applyJob(dataToPass).subscribe(
      (response: any) => {
        this.showSpinner = false;
        // if(this.isAlreadyOldUser){
        //       localStorage.setItem('isAlreadyOldUser', 'true');
        //     }
        //     this.router.navigate(['/thanks-for-applying']);

        if (response && response.Status == 401) {
          this.toastr.error(response.Message);
        }
        if (response.Error) {
          this.toastr.error(response.Message);
        } else {
          if (response && response.Status) {
            /****already applied job */
            if (response && response.Status && response.jobAlreadyApplied) {
              //this.toastr.success(response.Message);
              this.router.navigate(['/already-applied']);
              return;
            }

            if (this.isAlreadyOldUser) {
              if (this.isBrowser)
                localStorage.setItem('isAlreadyOldUser', 'true');
            }
            this.router.navigate(['/thanks-for-applying']);
          }
          console.log(response);
        }
      },
      (error) => { }
    );
  }

  checkZipZeros(str: any) {
    if (str && str.length) {
      str[0] = str[0].replace(', 00000', '');
      str[0] = str[0].replace(', 0000', '');
    }
    return str;
  }

  applyForJob() {
    this.showSpinner = true;
    // debugger
    let formData = new FormData();
    let payrate = '';
    // if (this.selectedJob.payrate) {
    //   payrate = this.selectedJob.payrate;
    // } else {
    //   payrate = this.selectedJob.payrange;
    //   // if (this.selectedJob.payrange1) {
    //   //   payrate = this.selectedJob.payrange1;
    //   // }
    //   // if (this.selectedJob.payrange2) {
    //   //   payrate += this.selectedJob.payrange2;
    //   // }
    // }

    // formData.append("userId", userId);
    formData.append('firstName', this.isBrowser ? localStorage.getItem('firstName') || '' : "");
    formData.append('lastName', this.isBrowser ? localStorage.getItem('lastName') || '' : "");
    formData.append('email', this.isBrowser ? localStorage.getItem('email') || '' : "");
    formData.append(
      'source',
      this.isBrowser ? localStorage.getItem('source') || 'curately'
        ? localStorage.getItem('source') || 'curately'
        : 'curately' : "curately"
    );
    formData.append('sourceLookupId', '10002002');
    formData.append('communityId', '1000');
    formData.append(
      'status',
      this.selectedJob.status ? this.selectedJob.status : ''
    );
    formData.append('accuickJobId', this.selectedJob.jobId);
    formData.append(
      'jobTitle',
      this.auditlogService.encryptAES(this.selectedJob.jobTitle)
    );
    formData.append('clientId', environment.clientId);
    formData.append('clientName', this.selectedJob.company);
    // this.auditlogService.encryptAES(this.selectedJob.companyDisplayName_)
    formData.append(
      'city',
      this.auditlogService.encryptAES(this.selectedJob.workCity)
    );
    formData.append(
      'state',
      ''
      // this.auditlogService.encryptAES(this.selectedJob.state)
    );
    formData.append(
      'zipcode',
      ''
      // this.auditlogService.encryptAES(this.selectedJob.zipcode)
    );
    formData.append('userId', this.userService.getUserId());
    formData.append('payRate', '');
    formData.append(
      'jobType',
      ''
      // this.auditlogService.encryptAES(this.selectedJob.jobtype)
    );
    formData.append(
      'description',
      this.auditlogService.encryptAES(this.selectedJob.interJobDescr)
    );
    formData.append('phoneNo', '');
    formData.append('userType', this.isBrowser ? localStorage.getItem('userTypeToken') || '' : '');
    formData.append('otpVerified', 'true');

    this.showSpinner = true;

    this.userService.applyJobCareer(formData).subscribe(
      (response) => {
        console.log(response.body);
        if (response.body.Success) {
          let cacheData = JSON.parse(this.isBrowser ? localStorage.getItem('totalData') || '' : '');
          // this.totalData = cacheData;
          if (cacheData && cacheData.length) {
            cacheData.forEach((el: any) => {
              if (el.jobId == this.selectedJob.jobId) {
                el.applied = true;
              }
            });
            if (this.isBrowser)
              localStorage.setItem('totalData', JSON.stringify(cacheData));
          }
          console.log(response.body, 'response.body', response);
          if (response.body.workflowURL) {
            window.open(
              `${response.body.workflowURL}`,
              '_self' // <- This is what makes it open in a new window.
            );
          } else {
            if (response.body.jobAlreadyApplied) {
              if (
                (response.body.userId || response.body.userType) &&
                response.body.firstName
              ) {
                // if (!this.highVolume) {
                this.userService.setUserId(response.body.userId);
                this.userService.setUserType(response.body.userType);
                if (this.isBrowser) {
                  localStorage.setItem('firstName', response.body.firstName);
                  localStorage.setItem('lastName', response.body.lastName);
                  localStorage.setItem('email', response.body.email);
                }

                this.router.navigate(['/already-applied']);
                // }
              } else {
                this.router.navigate(['/already-applied']);
              }
            } else {
              if (
                (response.body.userId || response.body.userType) &&
                response.body.firstName
              ) {
                // if (!this.highVolume) {
                this.userService.setUserId(response.body.userId);
                this.userService.setUserType(response.body.userType);
                if (this.isBrowser) {
                  localStorage.setItem('firstName', response.body.firstName);
                  localStorage.setItem('lastName', response.body.lastName);
                  localStorage.setItem('email', response.body.email);
                }

                this.router.navigate(['/thanks-for-applying']);
                // } else {

                // this.router.navigate(['/thanks-for-applying']);
                // }
              } else {
                this.router.navigate(['/thanks-for-applying']);
              }
            }
          }
        }
      },
      (error) => { }
    );
  }

  submitForm(event: any) {
    // debugger
    event.stopPropagation();
    console.log(event);
    console.log(this.loginForm);
    this.submitted = true;
    if (this.isBrowser) {
      const existingScript = document.querySelector(
        'script[type="application/ld+json"]'
      );

      if (existingScript) {
        existingScript.remove();
      }
    }
    // this.email?.nativeElement.focus();
    // this.firstName?.nativeElement.focus();
    // this.lastName?.nativeElement.focus();
    // this.phoneNo?.nativeElement.focus();

    // if (this.file && this.file.length) {
    //   this.loginForm.get('file').clearValidators(); // 5.Set Required Validator
    //   this.loginForm.get('file').updateValueAndValidity();
    // } else {
    //   this.loginForm.get('file').setValidators([Validators.required]); // 5.Set Required Validator
    //   this.loginForm.get('file').updateValueAndValidity();
    // }
    /***** Focus  */
    // if (this.showMore) {
    //   if (this.loginForm.controls['firstName'].invalid) {
    //     const firstcontrol = this.el.nativeElement.querySelector(
    //       '[formcontrolname="' + 'firstName' + '"]'
    //     );
    //     firstcontrol.focus();
    //     setTimeout(function () {
    //       window.scrollTo(0, 0);
    //     }, 100);
    //     // this will scroll page to the top
    //     this.loginForm.get('firstName').markAsTouched();
    //     this.loginForm.get('lastName').markAsTouched();
    //     this.loginForm.get('email').markAsTouched();
    //     this.loginForm.get('phoneNo').markAsTouched();
    //     this.loginForm.get('file').markAsTouched();
    //     return;
    //   }

    //   if (this.loginForm.controls['lastName'].invalid) {
    //     const lastcontrol = this.el.nativeElement.querySelector(
    //       '[formcontrolname="' + 'lastName' + '"]'
    //     );
    //     lastcontrol.focus();
    //     setTimeout(function () {
    //       window.scrollTo(0, 0);
    //     }, 100);

    //     return;
    //   }

    //   if (this.loginForm.controls['email'].invalid) {
    //     const emailcontrol = this.el.nativeElement.querySelector(
    //       '[formcontrolname="' + 'email' + '"]'
    //     );
    //     emailcontrol.focus();
    //     setTimeout(function () {
    //       window.scrollTo(0, 0);
    //     }, 100);
    //     return;
    //   }
    //   if (this.loginForm.controls['phoneNo'].invalid) {
    //     const phoneNocontrol = this.el.nativeElement.querySelector(
    //       '[formcontrolname="' + 'phoneNo' + '"]'
    //     );
    //     phoneNocontrol.focus();
    //     setTimeout(function () {
    //       window.scrollTo(0, 0);
    //     }, 100);
    //     return;
    //   }
    //   if (this.loginForm.controls['file'].invalid) {
    //     const filecontrol = this.el.nativeElement.querySelector(
    //       '[formcontrolname="' + 'file' + '"]'
    //     );
    //     filecontrol.focus();
    //     setTimeout(function () {
    //       window.scrollTo(0, 0);
    //     }, 100);
    //     return;
    //   }
    // }
    // if (this.showMore) {
    console.log(this.loginForm.controls);
    var vrkStmt = false;
    // this.submitButton?.nativeElement.focus()

    console.log(this.loginForm.controls['email'], 'kkjj');
    if (this.loginForm.controls['email'].invalid && !vrkStmt) {
      // this.firstName?.nativeElement.focus();
      if (this.email) {
        this.email.nativeElement.focus();
      }
      // const emailcontrol = this.el.nativeElement.querySelector(
      //   '[formcontrolname="' + 'email' + '"]'
      // );
      // emailcontrol.focus();
      // setTimeout(function () {
      //   window.scrollTo(0, 0);
      // }, 100);
      vrkStmt = true;
      return;
    }
    if (this.loginForm.controls['firstName'].invalid && !vrkStmt) {
      // this.email?.nativeElement.focus();
      if (this.firstName) {
        this.firstName.nativeElement.focus();
      }
      // const firstcontrol = this.el.nativeElement.querySelector(
      //   '[formcontrolname="' + 'firstName' + '"]'
      // );
      // firstcontrol.focus();
      // setTimeout(function () {
      //   window.scrollTo(0, document.body.scrollHeight);
      // }, 100);
      // this will scroll page to the top

      // this.loginForm.get('firstName').markAsTouched();
      // this.loginForm.get('lastName').markAsTouched();
      // this.loginForm.get('email').markAsTouched();
      // this.loginForm.get('phoneNo').markAsTouched();
      // this.loginForm.get('file').markAsTouched();
      vrkStmt = true;
      return;
    }

    if (this.loginForm.controls['lastName'].invalid && !vrkStmt) {
      // this.email?.nativeElement.focus();
      if (this.lastName) {
        this.lastName.nativeElement.focus();
      }

      // const lastcontrol = this.el.nativeElement.querySelector(
      //   '[formcontrolname="' + 'lastName' + '"]'
      // );
      // lastcontrol.focus();
      // setTimeout(function () {
      //   window.scrollTo(0, 0);
      // }, 100);
      vrkStmt = true;

      return;
    }
    if (this.loginForm.controls['phoneNo'].invalid && !vrkStmt) {
      // this.email?.nativeElement.focus();
      if (this.phoneNo) {
        this.phoneNo.nativeElement.focus();
      }
      // const phoneNocontrol = this.el.nativeElement.querySelector(
      //   '[formcontrolname="' + 'phoneNo' + '"]'
      // );
      // phoneNocontrol.focus();
      // setTimeout(function () {
      //   window.scrollTo(0, 0);
      // }, 100);
      vrkStmt = true;
      return;
    }

    if (
      !this.userService.isUserGuestFromResume() &&
      this.loginForm.controls['file'].invalid &&
      !vrkStmt
    ) {
      // this.email?.nativeElement.focus();
      if (this.fileInput) {
        this.fileInput.nativeElement.focus();
        if (this.isBrowser) {
          window.document?.querySelector('#file-id')?.scrollIntoView({
            block: 'center',
          });
        }
        this.toastr.error('Upload resume is mandatory');
      }
      // const filecontrol = this.el.nativeElement.querySelector(
      //   '[formcontrolname="' + 'file' + '"]'
      // );
      // filecontrol.focus();
      // setTimeout(function () {
      //   window.scrollTo(0, 0);
      // }, 100);
      vrkStmt = true;
      return;
    }

    if (!this.userService.isUserGuestFromResume()) {
      if (this.file && this.file.length) {
        this.loginForm.get('file').clearValidators(); // 5.Set Required Validator
        this.loginForm.get('file').updateValueAndValidity();
      } else {
        this.loginForm.get('file').setValidators([Validators.required]); // 5.Set Required Validator
        this.loginForm.get('file').updateValueAndValidity();
        if (this.isBrowser) {
          window.document?.querySelector('#file-id')?.scrollIntoView({
            block: 'center',
          });
        }
      }
    }

    if (this.loginForm.controls['terms'].invalid) {
      if (this.isBrowser) {
        window.document?.querySelector('#terms-id')?.scrollIntoView({
          block: 'center',
        });
      }
      return;
    }
    // }
    /**Focus End */

    if (!this.loginForm.valid) {
      this.loginForm.get('firstName').markAsTouched();
      this.loginForm.get('lastName').markAsTouched();
      this.loginForm.get('email').markAsTouched();
      this.loginForm.get('phoneNo').markAsTouched();
      if (!this.userService.isUserGuestFromResume()) {
        this.loginForm.get('file').markAsTouched();
      }

      return;
    }

    console.log(this.loginForm);
    // return;

    this.showSpinner = true;

    let formData = new FormData();
    let payrate = '';
    // if (this.selectedJob.payrate) {
    //   payrate = this.selectedJob.payrate;
    // } else {
    //   payrate = this.selectedJob.payrange;
    //   // if (this.selectedJob.payrange1) {
    //   //   payrate = this.selectedJob.payrange1;
    //   // }
    //   // if (this.selectedJob.payrange2) {
    //   //   payrate += this.selectedJob.payrange2;
    //   // }
    // }

    // formData.append("userId", userId);
    formData.append(
      'firstName',
      this.loginForm.value.firstName
        ? this.auditlogService.encryptAES(this.loginForm.value.firstName)
        : this.auditlogService.encryptAES(this.loginForm.value.firstName)
    );
    formData.append(
      'lastName',
      this.loginForm.value.lastName
        ? this.auditlogService.encryptAES(this.loginForm.value.lastName)
        : this.auditlogService.encryptAES(this.loginForm.value.lastName)
    );
    formData.append(
      'email',
      this.loginForm.value.email
        ? this.auditlogService.encryptAES(this.loginForm.value.email)
        : this.auditlogService.encryptAES(this.loginForm.value.email)
    );
    if (!this.userService.isUserGuestFromResume()) {
      formData.append('resume', this.file[0]);
    }
    if (this.userService.isUserGuestFromResume()) {
      let num: any = this.userService.getUserId();
      formData.append('userId', num);
      formData.append('matchMe', 'true');
    } else {
      formData.append('matchMe', 'false');
    }
    formData.append(
      'source',
      this.isBrowser ? localStorage.getItem('source') || 'curately'
        ? localStorage.getItem('source') || 'curately'
        : 'curately' : ""
    );
    formData.append('sourceLookupId', '10002002');
    formData.append('communityId', '1000');
    formData.append(
      'status',
      this.auditlogService.encryptAES(
        this.selectedJob.status ? this.selectedJob.status : ''
      )
    );
    formData.append('accuickJobId', this.selectedJob.jobId);
    formData.append(
      'jobTitle',
      this.auditlogService.encryptAES(this.selectedJob.jobTitle)
    );
    formData.append(
      'clientName',
      this.auditlogService.encryptAES(this.selectedJob.company)
    );
    formData.append('clientId', environment.clientId);
    formData.append(
      'city',
      this.auditlogService.encryptAES(this.selectedJob.workCity)
    );
    formData.append(
      'state',
      ''
      // this.auditlogService.encryptAES(this.selectedJob.state)
    );
    formData.append(
      'zipcode',
      ''
      // this.auditlogService.encryptAES(this.selectedJob.zipcode)
    );
    formData.append('payRate', this.auditlogService.encryptAES(payrate));
    formData.append(
      'jobType',
      ''
      // this.auditlogService.encryptAES(this.selectedJob.jobtype)
    );
    formData.append(
      'description',
      this.auditlogService.encryptAES(this.selectedJob.interJobDescr)
    );
    formData.append(
      'phoneNo',
      this.auditlogService.encryptAES(this.loginForm.value.phoneNo)
    );
    formData.append('userType', 'true');
    if (this.isBrowser) {
      if (localStorage.getItem('firsttimeUpload') === 'true') {
        formData.append('otpVerified', 'true');
      } else {
        formData.append('otpVerified', 'false');
      }
    }
    if (this.highVolume) {
      formData.append('highVolume', 'true');
    }

    this.showSpinner = true;

    this.userService.applyJobCareer(formData).subscribe(
      (response) => {
        console.log('after apply');
        console.log(response.body);
        this.showSpinner = false;
        if (response.body.Success) {
          let cacheData = JSON.parse(this.isBrowser ? localStorage.getItem('totalData') || '[]' : '[]');
          // this.totalData = cacheData;
          if (cacheData && cacheData.length) {
            cacheData.forEach((el: any) => {
              if (el.jobId == this.selectedJob.jobId) {
                el.applied = true;
              }
            });
            if (this.isBrowser)
              localStorage.setItem('totalData', JSON.stringify(cacheData));
          }

          if (response.body.hasOwnProperty('otp')) {
            console.log('response.body.otpppp', response.body.otp);
            // this.checkEmail(response.body.email)
            if (response && response.body && response.body.otp) {
              let dialogRef = this.dialog.open(VerifyEmailAccountComponent, {
                // height: 'calc(100% - 330px)',
                // width: 'calc(100% - 800px)',
                //  height: 'calc(100% - 300px)',
                //  width: 'calc(100% - 800px)',
                maxWidth: '850px',
                disableClose: true,
                data: {
                  data: {
                    otp: response.body.otp,
                    email: this.auditlogService.decryptAES(response.body.email),
                    firstName: this.auditlogService.decryptAES(
                      response.body.firstName
                    ),
                  },
                  modalPopup: '1',
                },
                // data: { data: {allData:response}, modalPopup: '1' },
              });
              dialogRef.afterClosed().subscribe((dialogResult) => {
                var closeResult = dialogResult;
                if (closeResult && closeResult.Success) {
                  if (closeResult.changeEmail) {
                    // this.firstName?.nativeElement.focus();
                    // this.email?.nativeElement.focus();
                    // this.email?.nativeElement.select(); commentd
                  } else {
                    // this.userService.setToken(
                    //   '46455757567567'
                    // );
                    // // this.loginForm.value.userType
                    this.userService.setUserId(response.body.userId);
                    this.userService.setUserType(response.body.userType);
                    if (this.isBrowser) {
                      localStorage.setItem('firstName', response.body.firstName);
                      localStorage.setItem('lastName', response.body.lastName);
                      localStorage.setItem('email', response.body.email);
                    }
                    // this.router.navigate(['/thanks-for-applying']);
                    this.applyForJob();
                  }
                }
              });
            }
          } else {
            if (response.body.workflowURL) {
              window.open(
                `${response.body.workflowURL}`,
                '_self' // <- This is what makes it open in a new window.
              );
            } else {
              if (
                response &&
                response.body.Status &&
                response.body.jobAlreadyApplied
              ) {
                // if (!this.highVolume) {
                this.userService.setToken(
                  response.headers.get('csn-auth-token')
                );
                this.userService.setUserType('true');
                if (this.isBrowser) {
                  localStorage.setItem('firstName', response.body.firstName);
                  localStorage.setItem('lastName', response.body.lastName);
                  localStorage.setItem('email', response.body.email);
                }
                this.sharedService.updateProfile({
                  firstName: response.body.firstName,
                  lastName: response.body.lastName,
                });

                // }
                this.router.navigate(['/already-applied']);
                return;
              } else {
                if (this.userService.isUserGuestFromResume()) {
                  if (!this.highVolume) {
                    this.userService.setToken(
                      response.headers.get('csn-auth-token')
                    );
                    this.userService.setUserType('true');
                    if (this.isBrowser) {
                      localStorage.setItem('firstName', response.body.firstName);
                      localStorage.setItem('lastName', response.body.lastName);
                      localStorage.setItem('email', response.body.email);
                    }
                    this.sharedService.updateProfile({
                      firstName: response.body.firstName,
                      lastName: response.body.lastName,
                    });
                  }
                  if (this.isBrowser) {
                    localStorage.setItem(
                      'resumeFirstName',
                      response.body.firstName
                    );
                    localStorage.setItem(
                      'resumeLastName',
                      response.body.lastName
                    );
                    localStorage.setItem('email', response.body.email);
                  }
                  this.router.navigate(['/thanks-for-applying']);
                } else {
                  // if (!this.highVolume) {
                  this.userService.setUserId(response.body.userId);
                  this.userService.setUserType('true');
                  if (this.isBrowser) {
                    localStorage.setItem('firstName', response.body.firstName);
                    localStorage.setItem('lastName', response.body.lastName);
                    localStorage.setItem('email', response.body.email);
                  }
                  this.sharedService.updateProfile({
                    firstName: response.body.firstName,
                    lastName: response.body.lastName,
                  });
                  if (response.body.userType) {
                    this.userService.setToken(
                      response.headers.get('csn-auth-token')
                    );
                  }
                  // }

                  this.router.navigate(['/thanks-for-applying']);
                }
              }
            }
            console.log('working 2nd', response.body.otp);
          }
        } else {
          this.showSpinner = false;
          this.toastr.error(response.body.Message);
        }
      },
      (error) => {
        this.showSpinner = false;
        this.toastr.error(error.body.Message);
      }
    );
    return;
    this.userService.applyjobexternalsites(formData).subscribe(
      (response) => {
        console.log(response);
        this.showSpinner = false;
        if (response.body && response.body.Success) {
          if (response.body.isExist) {
            let dialogRef = this.dialog.open(VerifyEmailAccountComponent, {
              // height: 'calc(100% - 330px)',
              // width: 'calc(100% - 800px)',
              //  height: 'calc(100% - 300px)',
              //  width: 'calc(100% - 800px)',
              maxWidth: '850px',
              data: {
                data: {
                  otp: response.body.otp,
                  email: this.auditlogService.decryptAES(response.body.email),
                  firstName: this.auditlogService.decryptAES(
                    response.body.firstName
                  ),
                },
                modalPopup: '1',
              },
              // data: { data: {allData:response.body}, modalPopup: '1' },
            });
            dialogRef.afterClosed().subscribe((dialogResult) => {
              var closeResult = dialogResult;
              if (closeResult && closeResult.Success) {
                if (response.body.userType) {
                  this.userService.setToken('46455757567567');
                  // response.headers.get('csn-auth-token')
                  this.userService.setUserId(response.body.userId);
                  this.userService.setUserType(response.body.userType);


                  // this.countChange.updateCount(
                  //   response.body.completedAssessments
                  // );
                  // this.countChange.updateTotal(response.body.totalAssessments);
                } else {
                  // localStorage.setItem('email',this.basicInfoForm.value.email);

                }
                if (response.body.jobAlreadyApplied) {
                  this.router.navigate(['/already-applied']);
                } else {
                  this.router.navigate(['/continue-apply']);
                }
              }
            }); //

            return;
          } else {
            if (response.body.userType) {
              this.userService.setToken(response.headers.get('csn-auth-token'));
              this.userService.setUserId(response.body.userId);
              this.userService.setUserType(response.body.userType);


              this.countChange.updateCount(response.body.completedAssessments);
              this.countChange.updateTotal(response.body.totalAssessments);
            } else {
              // localStorage.setItem('email',this.basicInfoForm.value.email);

            }
            if (response.body.jobAlreadyApplied) {
              this.router.navigate(['/already-applied']);
            } else {
              this.router.navigate(['/thanks-for-applying']);
            }
          }

          // this.getreviewdetails();
        } else {
          this.toastr.error(response.body.Message);
        }
      },
      (error) => { }
    );
    //}
  }

  createLoginForm(): void {
    this.submitted = true;
    if (!this.loginForm.valid) {
      return;
    }
    this.showSpinner = true;
    console.log(this.loginForm.value);
    let todo = {
      email: this.auditlogService.encryptAES(
        this.loginForm['controls'].email.value
      ),
      password: this.auditlogService.encryptAES(this.loginForm.value.password),
      sourceLookupId: 10002002,
      keepInSign: this.loginForm.value.check ? 1 : 0,
      //"communityId" : 1000,
      //"status" : 1
    };

    this.userService.login(todo).subscribe(
      (response) => {
        // this.listTodos();
        console.log(response);
        this.showSpinner = false;

        // console.log(response.headers.get('inc-auth-token'));
        if (response && response.body && response.body.Error) {
          this.toastr.error(response.body.Message);
        }
        if (response && response.body && response.body.Success) {
          this.userService.setToken(response.headers.get('csn-auth-token'));
          this.userService.setUserId(response.body.userId);
          this.userService.setUserType(response.body.userType);
          if (this.isBrowser) {
            localStorage.setItem(
              'isUploadResumeStatus',
              response.body.isUploadResumeStatus
            );
            localStorage.setItem(
              'completedAssessments',
              response.body.completedAssessments
            );
            localStorage.setItem(
              'totalAssessments',
              response.body.totalAssessments
            );
          }
          this.countChange.updateCount(response.body.completedAssessments);
          this.countChange.updateTotal(response.body.totalAssessments);
          if (this.isBrowser) {
            localStorage.setItem('firstName', response.body.firstName);
            localStorage.setItem('lastName', response.body.lastName);
            localStorage.setItem('email', response.body.email);
          }
          // if(localStorage.getItem("pageFrom") == 'accuick' && localStorage.getItem('jobData')){
          // this.router.navigate(['/thanks-for-applying']);
          this.loginApplyJob();
          return;
          // }
          // else if(localStorage.getItem("pageFrom") == 'assessments'){
          //   this.router.navigate(['/assessments']);
          //   return;
          // }
          if (response.body.isUploadResumeStatus == 0) {
            if (this.redirectTo) {
              this.router.navigate(['/upload-resume']);
            } else {
              this.router.navigate(['/upload-resume']);
            }
          } else if (response.body.isUploadResumeStatus == 1) {
            if (this.redirectTo) {
              this.router.navigate(['/create-upload-resume']);
            } else {
              this.router.navigate(['/create-upload-resume']);
            }
          } else {
            if (this.redirectTo) {
              this.router.navigate(['/profile']);
            } else {
              // if (localStorage.getItem('mailJobId')) {
              //   this.router.navigate(['/jobs']);
              // } else {
              //   if (localStorage.getItem('emailFromProfile')) {
              //     localStorage.removeItem('emailFromMail');
              //     localStorage.removeItem('emailFromProfile');
              //     this.router.navigate(['/profile']);
              //   } else {
              //     this.router.navigate(['/dashboard']);
              //   }
              // }
            }
          }
        }
        // this.router.navigate(['items'], { relativeTo: this.route });
      },
      (error) => { }
    );
  }

  clickJobsEvent() {
    this.staticAuditLogAPI('102', '');
    this.jobsTab = this.jobsTab;
  }

  getJobsApplied(type: any) {
    this.searched = false;
    this.showSpinner = true;
    this.userService.getJobsApplied().subscribe(
      (response: any) => {
        this.showSpinner = false;
        this.searched = true;
        if (response && response.Status == 401) {
          this.toastr.error(response.Message);
        }
        if (response && response.Success) {
          // response = JSON.parse(response);

          console.log('Jobs Applied');
          if (type) {
            this.staticAuditLogAPI('108', '');
          }
          console.log(response);
          if (response.Jobs.length) {
            response.Jobs.forEach((jobApp: any) => {
              jobApp.appliedDate = this.userService.getDateFormat(
                jobApp.appliedDate
              );
              this.jobsList.forEach((el) => {
                if (jobApp.accuickJobId == Number(el.jobid)) {
                  el.applied = true;
                }
              });
              jobApp.city = jobApp.city
                ? this.auditlogService.decryptAES(jobApp.city)
                : '';
              jobApp.clientName = jobApp.clientName
                ? this.auditlogService.decryptAES(jobApp.clientName)
                : '';
              jobApp.jobTitle = jobApp.jobTitle
                ? this.auditlogService.decryptAES(jobApp.jobTitle)
                : '';
              jobApp.state = jobApp.state
                ? this.auditlogService.decryptAES(jobApp.state)
                : '';
              jobApp.zipcode = jobApp.zipcode
                ? this.auditlogService.decryptAES(jobApp.zipcode)
                : '';
              jobApp.payRate = jobApp.payRate
                ? this.auditlogService.decryptAES(jobApp.payRate)
                : '';
              jobApp.jobType = jobApp.jobType
                ? this.auditlogService.decryptAES(jobApp.jobType)
                : '';
              jobApp.description = jobApp.description
                ? this.auditlogService.decryptAES(jobApp.description)
                : '';
            });
          }
          this.jobsAppliedList = response.Jobs;
        }
      },
      (error) => { }
    );
  }

  getcareerjobdetails() {
    let id = this.jobIdToLoad;
    // let datatopass = {
    //   "jobName": this.jobIdToLoad
    // }
    this.userService.getjobdatabase(id, "3").subscribe(
      (response: any) => {
        this.showSpinner = false;
        console.log(response);
        if (response && response.Status == 401) {
          this.toastr.error(response.Message);
        }
        if (response && response.Success) {
          if (response.Job[0].workFlow.length !== 0) {
            this.isSubmit = false;
          } else {
            this.isSubmit = true;
          }
          // response = JSON.parse(response);
          if (this.isBrowser) {
            localStorage.setItem('pageFrom', 'accuick');
          }
          console.log("is coming", response.Job[0])
          this.jobData = response.Job[0];
          this.updateMetaTags(response.Job[0])
          this.policyList = response.Job[0].policy;
          console.log(this.policyList, 'this.policyList', response);

          // response[0].job_url = location.pathname;
          // response.forEach((el: any) => {
          //   el.date = this.userService.getDateFormat(el.date);
          //   el.applied = false;
          //   el.description = this.rj.removeJunk(el.description);
          //   el.descShort = this.rj.removeJunk(
          //     el.description.replace(/\r\n/g, ' ').replace(/<br \/>/g, ' ')
          //   );
          //     el.payrange1 = el.payrange;
          // });
          // response.JobDetails[0].description_ = this.rj.removeJunk(response.JobDetails[0].description_);
          if (this.isBrowser) {
            localStorage.setItem('jobData', JSON.stringify(response.Job[0]));
          }
          // let resulObj = response.JobDetails[0];
          // let employmentTypesString = '';
          // resulObj.employmentTypes_.forEach((el: any) => {
          //   el = el.toString();
          //   // console.log(this.jobTypesList[el]);
          //   // employmentTypesString = employmentTypesString +  this.jobTypesList[el]
          // })
          this.selectedJob = response.Job[0];
          // console.log(this.selectedJob.customAttributes_.mapData.payrange.stringValues_);

          if (this.userService.isUserLoggedIn()) {
            // this.applyForJob();
          }
        }
      },
      (error) => { }
    );
  }
  getRecommendJobs() {
    this.searched = false;
    this.showSpinner = true;
    // let jobId = localStorage.getItem('mailJobId')
    //   ? localStorage.getItem('mailJobId')
    //   : 0;
    this.userService.getAccuickJob().subscribe(
      (response: any) => {
        this.showSpinner = false;
        if (response && response.Status == 401) {
          this.toastr.error(response.Message);
        }
        if (response && response.length) {
          // response = JSON.parse(response);

          console.log(response);
          // debugger
          if (response.length) {
            const tobeSelJob = this.jobIdToLoad;
            response.forEach(function (item: any, i: number) {
              if (item.jobid == tobeSelJob) {
                response.splice(i, 1);
                response.unshift(item);
              }
            });
            if (this.isBrowser) {
              if (localStorage.getItem('mailJobId')) {
                let locVal: string | any = localStorage.getItem('mailJobId');
                let flexTempObj = response.filter(function (obj: any) {
                  return obj.jobid == locVal;
                });
                if (flexTempObj && flexTempObj.length) {
                  this.selectedJob = flexTempObj[0];
                } else {
                  this.selectedJob = response[0];
                }
                localStorage.removeItem('mailJobId');
              } else {
                this.selectedJob = response[0];
              }
            }
            // this.candData.flexibilityPref = (flexTempObj.length) ? flexTempObj[0].lookupValue : '';

            // let index = response.findIndex(x => x.jobid === "Skeet");
            // console.log(flexTempObj);
            // this.assessmentsAry
            this.assessmentsAry =
              this.selectedJob.assessment && this.selectedJob.assessment.length
                ? this.selectedJob.assessment.split(',')
                : [];
            // console.log(assessmentsAry);
            // if((assessRequiredAry && assessRequiredAry.length)){
            //     assessRequiredAry.forEach((el: any) => {
            //       console.log(el);
            //     });

            // }

            response.forEach((el: any) => {
              el.date = this.userService.getDateFormat(el.date);
              el.applied = false;
              el.description = this.rj.removeJunk(el.description);
              el.descShort = this.rj.removeJunk(
                el.description.replace(/\r\n/g, ' ').replace(/<br \/>/g, ' ')
              );
              el.payrange1 = el.payrange;
              // if (el.payrange.includes('-')) {
              //   if (el.payrange.split('-')[0]) {
              //     el.payrange1 = parseFloat(el.payrange.split('-')[0]).toFixed(
              //       2
              //     );
              //     el.payrange1 = el.payrange1 != '0.00' ? el.payrange1 : '';
              //   }
              //   if (el.payrange.split('-')[1]) {
              //     el.payrange2 = parseFloat(el.payrange.split('-')[1]).toFixed(
              //       2
              //     );
              //     el.payrange2 = el.payrange2 != '0.00' ? el.payrange2 : '';
              //   }
              //   el.payrange = '';
              // }
            });
            this.selectedIndex = 0;
          }
          this.jobsList = response;
          this.searched = true;

          // if (this.isMobile) {
          //   const dialogRef = this.dialog.open(ShowApplyJobComponent, {
          //     maxWidth: "800px",
          //     data: { selectedJob: this.selectedJob,pageName:'apply-jobs' },
          //     // hasBackdrop: false,
          //   });

          //   dialogRef.afterClosed().subscribe((result: { status: Boolean; }) => {
          //     if (result) {
          //       // this.jobsList[i].applied = result.status;
          //     }
          //     console.log(result);
          //   });
          // }
          // this.getJobsApplied(false);
        }
      },
      (error) => { }
    );
  }

  getcategorylist() {
    // console.log(this.loginForm.value);
    this.userService.getcategorylist().subscribe(
      (response: any) => {
        if (response && response.Success) {
          this.userService.categoryList = response.CategoryList;
          this.loadObjects();
        }
      },
      (error) => { }
    );
  }

  loadObjects() {
    let curEmpStatusobj = this.userService.categoryList.filter(function (
      obj: any
    ) {
      return obj.categoryID == 10010;
    });
    this.jobtypes =
      curEmpStatusobj && curEmpStatusobj.length
        ? curEmpStatusobj[0].lookupsList
        : [];
  }

  // openCandidateBenefitsModal(): void {
  //   const dialogRef = this.dialog.open(ShowCandidateBenefitsComponent, {
  //     height: 'calc(100% - 400px)',
  //     data: { candData: 'test', candPage: '2' },
  //     // hasBackdrop: false,
  //   });

  //   dialogRef.afterClosed().subscribe((result) => {
  //     if (result) {
  //       //this.jobsList[i].applied = result.status;
  //     }
  //     console.log(result);
  //   });
  // }

  selectJob(i: number) {
    this.selectedJob = this.jobsList[i];
    this.selectedIndex = i;
    // if (this.isMobile) {
    //   const dialogRef = this.dialog.open(ShowJobComponent, {
    //     maxWidth: "800px",
    //     data: { selectedJob: this.selectedJob,pageName:'find-jobs' },
    //     // hasBackdrop: false,
    //   });

    //   dialogRef.afterClosed().subscribe((result: { status: Boolean; }) => {
    //     if (result) {
    //       this.jobsList[i].applied = result.status;
    //     }
    //     console.log(result);
    //   });
    // }
  }
  applyJob() {
    if (this.isBrowser) {
      localStorage.setItem('pageFrom', 'accuick');
      localStorage.setItem('jobData', JSON.stringify(this.selectedJob));
    }
    if (!this.userService.isUserLoggedIn()) {
      this.router.navigate(['/login']);
      Emitters.authEmitter.emit(false);
    } else {
      Emitters.authEmitter.emit(true);
      this.router.navigate(['/thanks-for-applying']);
      // this.router.navigate(['/thankyou-for-apply']);
    }
    this.router.navigate(['/login']);
    return;
    let payrate = '';
    if (this.selectedJob.payrate) {
      payrate = this.selectedJob.payrate;
    } else {
      payrate = this.selectedJob.payrange;
      // if (this.selectedJob.payrange1) {
      //   payrate = this.selectedJob.payrange1;
      // }
      // if (this.selectedJob.payrange2) {
      //   payrate += this.selectedJob.payrange2;
      // }
    }
    let dataToPass = {
      accuickJobId: this.selectedJob.jobid,
      userId: Number(this.userService.getUserId()),
      jobTitle: this.auditlogService.encryptAES(this.selectedJob.jobtitle),
      clientName: this.auditlogService.encryptAES(this.selectedJob.compname),
      city: this.auditlogService.encryptAES(this.selectedJob.city),
      state: this.auditlogService.encryptAES(this.selectedJob.state),
      zipcode: this.auditlogService.encryptAES(this.selectedJob.zipcode),
      payRate: this.auditlogService.encryptAES(payrate),
      jobType: this.auditlogService.encryptAES(this.selectedJob.jobtype),
      description: this.auditlogService.encryptAES(
        this.selectedJob.description
      ),
      source: 'curately',
    };
    this.showSpinner = true;
    this.userService.applyJob(dataToPass).subscribe(
      (response: any) => {
        this.showSpinner = false;
        if (response && response.Status == 401) {
          this.toastr.error(response.Message);
        }
        if (response && response.Status) {
          if (response.Error) {
            this.toastr.error(response.Message);
          } else {
            this.jobsList[this.selectedIndex].applied = true;
            this.selectedJob.applied = true;
            if (response.Message.includes('already')) {
              this.toastr.info(response.Message);
            } else {
              this.toastr.success(response.Message);
            }
          }
          console.log(response);
        }
      },
      (error) => { }
    );
  }

  checkVersion(version: any) {
    this.userService.checkVersion(version).subscribe(
      (response: any) => {
        if (response.Error) {
          window.location.reload();
        }
      },
      (error) => { }
    );
  }

  backtoresults() {
    if (this.isBrowser) {
      localStorage.setItem('showPrevRecord', 'true');
    }
    let isBmsFIndJobs = sessionStorage.getItem('isBmsFindJobs');
    let isElevanceFIndJobs = sessionStorage.getItem('isElevance');
    console.log(isBmsFIndJobs, 'isBmsFIndJobs');
    // if (isBmsFIndJobs === 'true') {
    //   this.router.navigate([
    //     '/jobs/' + localStorage.getItem('clientShortCode') + '/bms-find-jobs',
    //   ]);
    // } else if (isElevanceFIndJobs === 'true') {
    //   this.router.navigate([
    //     '/jobs/' + localStorage.getItem('clientShortCode') + '/elevance-find-jobs',
    //   ]);
    // } else
    if (this.isBrowser) {
      const existingScript = document.querySelector(
        'script[type="application/ld+json"]'
      );
      if (existingScript) {
        existingScript.remove();
      }
    }
    this.router.navigate(['/jobs/' + this.userService.getClientShortCode()]);
  }

  onFocusEmailField() {
    this.isEmailFocused = true;
  }

  checkEmail(event: Event): void {
    setTimeout(() => {
      this.isEmailFocused = false;
    }, 1000);

    console.log('checkEmailll', event);
    // if (event instanceof KeyboardEvent && event.key === 'Enter') {
    // console.log(localStorage.getItem('firsttimeUpload'));
    if (this.isBrowser) {
      if (localStorage.getItem('firsttimeUpload') === 'true') {
        if (localStorage.getItem('email') !== this.loginForm.value.email) {
          if (this.loginForm.controls.email.status == 'VALID') {
            let formData = new FormData();
            formData.append(
              'email',
              this.auditlogService.encryptAES(this.loginForm.value.email)
            );
            let dataToPass = {
              email: this.auditlogService.encryptAES(this.loginForm.value.email),
            };

            this.userService.getemailDetail(dataToPass).subscribe(
              (response: any) => {
                if (response && response.otp) {
                  // localStorage.setItem('firsttimeUpload', 'false')

                  let dialogRef = this.dialog.open(VerifyEmailAccountComponent, {
                    // height: 'calc(100% - 330px)',
                    // width: 'calc(100% - 800px)',
                    //  height: 'calc(100% - 300px)',
                    //  width: 'calc(100% - 800px)',
                    maxWidth: '850px',
                    disableClose: true,
                    data: {
                      data: {
                        otp: response.otp,
                        email: this.auditlogService.decryptAES(response.email),
                        firstName: this.auditlogService.decryptAES(
                          response.firstName
                        ),
                      },
                      modalPopup: '1',
                    },
                    // data: { data: {allData:response}, modalPopup: '1' },
                  });
                  dialogRef.afterClosed().subscribe((dialogResult) => {
                    var closeResult = dialogResult;
                    if (closeResult && closeResult.Success) {
                      if (closeResult.changeEmail) {
                        // this.firstName?.nativeElement.focus();
                        // this.email?.nativeElement.focus();
                        // this.email?.nativeElement.select(); commentd
                      } else {
                        // this.userService.setToken(
                        //   '46455757567567'
                        // );
                        // // this.loginForm.value.userType
                        this.userService.setUserId(response.userId);
                        this.userService.setUserType(response.userType);

                        localStorage.setItem('firstName', response.firstName);
                        localStorage.setItem('lastName', response.lastName);
                        localStorage.setItem('email', response.email);

                        // this.router.navigate(['/thanks-for-applying']);
                        this.applyForJob();
                      }
                    }
                  });
                } else {
                  localStorage.setItem('firsttimeUpload', 'true');
                }
              },
              (error) => { }
            );
          }
        }
      } else {
        if (this.loginForm.controls.email.status == 'VALID') {
          let formData = new FormData();
          formData.append(
            'email',
            this.auditlogService.encryptAES(this.loginForm.value.email)
          );
          let dataToPass = {
            email: this.auditlogService.encryptAES(this.loginForm.value.email),
          };

          this.userService.getemailDetail(dataToPass).subscribe(
            (response: any) => {
              if (response && response.otp) {
                // localStorage.setItem('firsttimeUpload', 'false')

                let dialogRef = this.dialog.open(VerifyEmailAccountComponent, {
                  // height: 'calc(100% - 330px)',
                  // width: 'calc(100% - 800px)',
                  //  height: 'calc(100% - 300px)',
                  //  width: 'calc(100% - 800px)',
                  maxWidth: '850px',
                  disableClose: true,
                  data: {
                    data: {
                      otp: response.otp,
                      email: this.auditlogService.decryptAES(response.email),
                      firstName: this.auditlogService.decryptAES(
                        response.firstName
                      ),
                    },
                    modalPopup: '1',
                  },
                  // data: { data: {allData:response}, modalPopup: '1' },
                });
                dialogRef.afterClosed().subscribe((dialogResult) => {
                  var closeResult = dialogResult;
                  if (closeResult && closeResult.Success) {
                    if (closeResult.changeEmail) {
                      // this.firstName?.nativeElement.focus();
                      // this.email?.nativeElement.focus();
                      // this.email?.nativeElement.select(); commentd
                    } else {
                      // this.userService.setToken(
                      //   '46455757567567'
                      // );
                      // // this.loginForm.value.userType
                      this.userService.setUserId(response.userId);
                      this.userService.setUserType(response.userType);

                      localStorage.setItem('firstName', response.firstName);
                      localStorage.setItem('lastName', response.lastName);
                      localStorage.setItem('email', response.email);

                      // this.router.navigate(['/thanks-for-applying']);
                      this.applyForJob();
                    }
                  }
                });
              } else {
                localStorage.setItem('firsttimeUpload', 'true');
              }
            },
            (error) => { }
          );
        }
      }
    }

    // }

    // console.log(this.loginForm.value.email)
  }

  setDynamicColor() {
    // const dynamicButtonColor = this.jsonData.buttonColor; // Assuming you want to use the color of the first item
    // document.documentElement.style.setProperty('--dynamic-button-color', dynamicButtonColor);
    // const dynamicBrandColorColor = this.jsonData.brandColorColor; // Assuming you want to use the color of the first item
    // document.documentElement.style.setProperty('--dynamic-brand-color', dynamicBrandColorColor);

    this.isBmsUrl = window.location.pathname
      .split('/')
      .includes('bms-find-jobs');

    this.isElevanceUrl = window.location.pathname
      .split('/')
      .includes('elevance-apply-jobs');

    const dynamicButtonColor = this.isBmsUrl
      ? '#be2bbb'
      : this.isElevanceUrl
        ? '#286CE2'
        : this.jsonData.buttonColor; // Assuming you want to use the color of the first item
    if (this.isBrowser) {
      document.documentElement.style.setProperty(
        '--dynamic-button-color',
        dynamicButtonColor
      );
    }
    const dynamicBrandColorColor = this.isBmsUrl
      ? '#be2bbb'
      : this.isElevanceUrl
        ? '#286CE2'
        : this.jsonData.brandColorColor; // Assuming you want to use the color of the first item
    if (this.isBrowser) {
      document.documentElement.style.setProperty(
        '--dynamic-brand-color',
        dynamicBrandColorColor
      );
    }
  }

  getByShortNameFunc() {
    let currUrl = this.location.path();
    let ary1 = currUrl.split('/apply-jobs');
    console.log(ary1);
    console.log('ary1');
    if (ary1 && ary1.length == 2) {
      let ary2 = ary1[0].split('/jobs/');
      console.log(ary2);
      console.log('ary2');
      let findChatBotType = ary1[1].indexOf('type=');
      if (findChatBotType !== -1) {
        let ary3 = ary1[1].split('type=');
        console.log(ary3);
        console.log('ary3');
        if (ary3 && ary3.length) {
          if (this.isBrowser) {
            localStorage.setItem('chatbotType', ary3[1]);
          }
        }
      } else {
        if (this.isBrowser) {
          localStorage.setItem('chatbotType', '1');
        }
      }
      if (ary2 && ary2.length == 2) {
        if (this.isBrowser) {
          localStorage.setItem('clientShortCode', ary2[1]);
        }
      }
    }
    this.showSpinner = true;
    this.userService.getByShortName().subscribe(
      (response: any) => {
        console.log('getByShortName response', response);
        if (response.Success) {
          this.showSpinner = false;
          this.jsonData = {
            buttonColor: response.buttonColor,
            brandColorColor: response.brandColor,
          };
          this.setDynamicColor();
          this.sharedService.updateClientCode({
            shortcode: response.shortName,
          });
          this.sharedService.updateClientLogo({
            logo: `${environment.amazonS3}${response.logo}`,
          });
          this.sharedService.updateClientSecondaryLogo({
            logo: `${environment.amazonS3}${response.SecondaryLogo}`,
          });

          this.highVolume = false;
          if (this.isBrowser) {
            localStorage.setItem('highVolume', 'false');
          }

          if (response.plateform && response.plateform.length) {
            // if(response.plateform[0].id == 30002){
            this.highVolume = true;
            if (this.isBrowser) {
              localStorage.setItem('highVolume', 'true');
            }
            this.sharedService.updateHighVolume({ status: true });

            // }
          }

          // --show-chatbot
          environment.clientId = response.clientId.toString();
          this.updateForm();

          // var chtbtStatus = localStorage.getItem("showchatbot");
          // console.log(chtbtStatus)
          // let x:any = document.getElementById('iFrameDiv');
          // if (checkChtbotStatus == "-1"){
          //   x.style.display = 'none'
          // } else {
          //   x.style.display = 'block'
          // }

          // 20005 - career
          // 20006 - chatbot
          // this.jsonData = {
          //   buttonColor: 'red',
          //   brandColorColor: 'yellow',
          // }
        }
      },
      (error: any) => {
        this.showSpinner = false;
      }
    );
  }

  updateForm() {
    if (this.userService.isUserGuestFromResume()) {
      this.isUserGuestFromResume = true;
      // this.isResumeUploadedViaMatchMe = true;
      // this.resumeFirstName = localStorage.getItem('resumeFirstName') ? localStorage.getItem('resumeFirstName'): '';
      // this.resumeLastName = localStorage.getItem('resumeLastName') ? localStorage.getItem('resumeLastName') : '';
      this.loginForm = this.formBuild.group({
        firstName: new FormControl(
          this.isBrowser ? localStorage.getItem('resumeFirstName')
            ? localStorage.getItem('resumeFirstName')
            : '' : "",
          [Validators.required]
        ),
        lastName: new FormControl(
          this.isBrowser ? localStorage.getItem('resumeLastName')
            ? localStorage.getItem('resumeLastName')
            : '' : '',
          [Validators.required]
        ),
        email: new FormControl(

          this.isBrowser ? localStorage.getItem('email') ? localStorage.getItem('email') : '' : '',
          [
            Validators.required,
            Validators.pattern(
              /^([A-Za-z0-9_\-\.])+\@(?!(?:[A-Za-z0-9_\-\.]+\.)?([A-Za-z]{2,4})\.\2)([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/
            ),
          ]
        ),
        phoneNo: new FormControl(
          this.isBrowser ? localStorage.getItem('candPhoneNumber')
            ? localStorage.getItem('candPhoneNumber')
            : '' : '',
          [Validators.required]
        ),
        // file: new FormControl('', [Validators.required]),
        terms: new FormControl(false, [Validators.required]),
      });
    } else {
      this.isUserGuestFromResume = false;
      this.loginForm = this.formBuild.group({
        firstName: new FormControl('', [Validators.required]),
        lastName: new FormControl('', [Validators.required]),
        email: new FormControl(this.emailId, [
          Validators.required,
          Validators.pattern(
            /^([A-Za-z0-9_\-\.])+\@(?!(?:[A-Za-z0-9_\-\.]+\.)?([A-Za-z]{2,4})\.\2)([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/
          ),
        ]),
        phoneNo: new FormControl('', [Validators.required]),
        file: new FormControl('', [Validators.required]),
        userType: new FormControl(true),
      });

      this.loginForm.addControl(
        'terms',
        new FormControl(false, Validators.required)
      );
    }


    this.HideSummary = false;
    this.isMobile = window.innerWidth > 1050 ? true : false;
    //this.showMore = window.innerHeight < 720 ? true : false;
    this.render.listen('window', 'scroll', () => {
      // const rect = this.el.nativeElement.getBoundingClientRect().top;
      this.isMobileHeight = this.el.nativeElement.getBoundingClientRect().top;
      // console.log('higth==' + this.isMobileHeight);
      this.showMore = this.isMobileHeight >= 0 ? false : true;

      // console.log(this.showMore);
    });
  }

  ngOnInit(): void {

    this.actRoute.params.subscribe((params) => {
      console.log('params');
      console.log(params);
      // this.jobIdFromMail = params.ti ? params.email : '';
      this.jobIdToLoad = params.id ? params.id : '';
      // if (params.id) {
      //   this.jobIdToLoad = params.id;
      // }
    });
    this.getcareerjobdetails();
    // this.titleService.setTitle('New Title');
    console.log(this.jobData, 'this.jobData')
    // this.meta.updateTag({ property: 'og:title', content: this.jobData.jobTitle }, 'property="og:title"');
    this.sharedService.triggerHeaderNgOnInit();

    this.sharedService.triggerHeaderNgOnInit();
    // this.sharedService.highVolume$.subscribe(({ status }) => {
    //   // console.log('highVolume:', status);
    //   this.highVolume = status;// ? true : false;
    // });
    if (this.isBrowser) {
      if (
        localStorage.getItem('highVolume') &&
        localStorage.getItem('highVolume') == 'true'
      ) {
        this.highVolume = true;
      }
    }
    var reloadnum = Number(this.isBrowser ? localStorage.getItem('reloaded') : '') || '0';
    reloadnum = Number(reloadnum);
    if (reloadnum && reloadnum == 2) {
      if (this.isBrowser) {
        localStorage.removeItem('reloaded');
      }
    } else {
      this.checkVersion(environment.buildVersion);
      reloadnum = reloadnum + 1;
      if (this.isBrowser) {
        localStorage.setItem('reloaded', reloadnum.toString());
      }
    }
    if (!this.userService.isUserLoggedIn()) {
      this.isAlreadyOldUser = true;
    }

    // alert(document.referrer);
    if (environment.clientId) {
      this.updateForm();
    } else {
      this.getByShortNameFunc();
    }

    // this.loginForm = this.formBuild.group({
    //   firstName: new FormControl('', [Validators.required]),
    //   lastName: new FormControl('', [Validators.required]),
    //   email: new FormControl(this.emailId, [
    //     Validators.required,
    //     Validators.pattern(
    //       /^([A-Za-z0-9_\-\.])+\@(?!(?:[A-Za-z0-9_\-\.]+\.)?([A-Za-z]{2,4})\.\2)([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/
    //     ),
    //   ]),
    //   phoneNo: new FormControl('', [Validators.required]),
    //   file: new FormControl('', [Validators.required]),
    //   userType: new FormControl(true),
    // });

    this.actRoute.queryParams.subscribe((params) => {
      // this.emailid = params.emailid ? params.emailid : '';
      console.log(params);
      this.jobIdFromMail = params.email ? params.email : '';
      // this.jobIdToLoad = params.jobid ? params.jobid : '';

      let urlSsource = this.isBrowser ? document.referrer : "";
      // console.log(urlSsource);
      if (urlSsource.indexOf('cxninja') != -1) urlSsource = 'cxninja';
      else if (urlSsource == '') urlSsource = 'curately';
      else if (urlSsource.indexOf('monster') != -1) urlSsource = 'Monster';
      else if (urlSsource.indexOf('google') != -1) urlSsource = 'Google';
      else if (urlSsource.indexOf('indeed') != -1) urlSsource = 'Indeed';
      else if (urlSsource.indexOf('linkedin') != -1) urlSsource = 'linkedin';
      else if (urlSsource.indexOf('glassdoor') != -1) urlSsource = 'glassdoor';
      else if (urlSsource.indexOf('naukri') != -1) urlSsource = 'naukri';
      else if (urlSsource.indexOf('snagajob') != -1) urlSsource = 'snagajob';
      else if (urlSsource.indexOf('careerbuilder') != -1)
        urlSsource = 'careerbuilder';
      else if (urlSsource.indexOf('flexjobs') != -1) urlSsource = 'flexjobs';
      else if (urlSsource.indexOf('usajobs') != -1) urlSsource = 'usajobs';
      else if (urlSsource.indexOf('curately') != -1) urlSsource = 'curately';
      else urlSsource = 'curately';
      // else urlSsource = 'cxninja';
      let source = urlSsource; //params.source ? params.source : 'accuick';
      console.log(source);
      if (this.isBrowser) {
        localStorage.setItem('source', source);
      }
    });

    // this.getRecommendJobs();
  }

  updateMetaTags(resp: any): void {
    this.showSpinner = true;
    // console.log(response, 'eee')
    // this.titleService.setTitle('Your Page Title');

    // this.meta.updateTag({ name: 'description', content: 'Your page description' });
    // this.meta.updateTag({ name: 'keywords', content: 'your, keywords, here' });

    // Open Graph tags for social media
    // const metaTitle = this.transferState.get(this.META_TITLE_KEY, resp.jobTitle);
    this.meta.updateTag({ property: 'og:title', content: resp.jobTitle }, 'property="og:title"');
    this.meta.updateTag({ name: 'description', property: 'og:description', content: resp.publicJobDescr.replace(/<[^>]*>/g, '') },
      'property="og:description"');
    this.showSpinner = false;
    // if (this.isBrowser)
    // window.location.href = "https://careers.curately.ai" + location.pathname;
    // this.meta.addTag(
    //   { name: 'description', content: resp.publicJobDescr.replace(/<[^>]*>/g, '') }
    // );

    // this.meta.updateTag({ property: 'og:image', content: 'https://example.com/image.jpg' });
  }
  async ngAfterViewInit() {

    // await this.loadScript('assets/js/cloudflare-script.js');
    // console.log('isccaa')
    // var s = document.createElement("script");
    // s.type = "text/javascript";
    // s.src = "assets/js/cloudflare-script.js";
    // this.elementRef.nativeElement.appendChild(s);
    this.addJsonLdSchema();
  }
  private loadScript(scriptUrl: string) {
    console.log('is loading');
    return new Promise((resolve, reject) => {
      if (this.isBrowser) {
        const scriptElement = document.createElement('script');
        scriptElement.src = scriptUrl;
        scriptElement.onload = resolve;
        document.body.appendChild(scriptElement);
      }
    });
  }

  private addJsonLdSchema() {
    console.log('is addJsonLdSchema');
    if (this.selectedJob) {
      const schemaData = {
        '@context': 'https://schema.org/',
        '@type': 'JobPosting',
        title: this.selectedJob.jobTitle,
        description: this.selectedJob.interJobDescr,
        directApply: true,
        identifier: {
          '@type': 'PropertyValue',
          name: 'Curately',
          value: '5964832',
        },
        datePosted: this.dateFormat(this.selectedJob.createDate),
        validThrough: '**Job Expiry Date**',
        employmentType: this.jobTypesList[this.selectedJob.jobType],
        hiringOrganization: {
          '@type': 'Organization',
          // "name": this.clientDetailsObj.clientName,
          // "sameAs": "**Client Career Portal URL**",
          // "logo": this.clientDetailsObj.logo
          name: this.isBrowser ? localStorage.getItem('clientName') : '',
          sameAs: '**Client Career Portal URL**',
          logo: this.isBrowser ? localStorage.getItem('cLogo') : '',
        },
        applicantLocationRequirements: {
          '@type': 'Country',
          name: this.selectedJob.workState,
        },
        jobLocationType: '',
        jobLocation: {
          '@type': 'Place',
          address: {
            '@type': 'PostalAddress',
            streetAddress: '**Job Street Address**',
            addressLocality: this.selectedJob.workCity,
            addressRegion: ' *Job Region or State* ',
            postalCode: this.selectedJob.workZipcode,
            addressCountry: this.selectedJob.workState,
          },
        },
        workHours: '',
        jobImmediateStart: 'Yes',
        jobStartDate: '**Job Start Date**',
        skills: '**Job Skills Separated by Comma**',
        totalJobOpenings: 1,
        baseSalary: {
          '@type': 'MonetaryAmount',
          currency: 'USD',
          value: {
            '@type': 'QuantitativeValue',
            maxValue: this.selectedJob.payrateMax,
            minValue: this.selectedJob.payrateMin,
            unitText: 'HOUR',
          },
        },
      };
      if (this.isBrowser) {
        const s = document.createElement('script');
        s.type = 'application/ld+json';
        s.text = JSON.stringify(schemaData);
        document.head.appendChild(s);
      }
    }
  }

  dateFormat = (dateString: string): string => {
    // Parse the date string using Moment.js
    const parsedDate = moment(dateString, 'YYYY-MM-DD HH:mm:ss.S');

    // Format the date string without time
    const formattedDate = parsedDate.format('YYYY-MM-DD');

    return formattedDate;
  };

  getAssessmentName(assessmentname: any) {
    let obj = this.selectedJob.requiredAssessments.find((assessments: any) => {
      if (assessments.assessmentsId === assessmentname.trim()) return true;
      else return false;
    });
    return obj;
  }

  trimString(text: any, length: any) {
    return text.length > length ? text.substring(0, length) + '...' : text;
  }

  dontAllow() {
    return false;
  }

  numberOnly(event: { which: any; keyCode: any }): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  staticAuditLogAPI(actionId: string, jsonString: string) {
    let num: any = this.userService.getUserId(); //number
    //let stringForm = num.toString();
    this.auditObj.actionId = actionId;
    this.auditObj.userId = num;
    this.auditObj.jsonData = jsonString;
    // console.log(this.auditObj);
    //return false;
    this.auditlogService.staticAuditLogSave(this.auditObj).subscribe(
      (response) => {
        console.log(response);
        // if(response.Error){
        //     this.toastr.error(response.Message);
        // }
        if (response.Success) {
        }
      },
      (error) => { }
    );
  }

  openTermsContent(term: any) {
    if (term.policyContent) {
      if (this.isBrowser) {
        localStorage.setItem('termsContent', term.policyContent);
      }

      window.open(
        `${window.location.origin}/policy-terms`,
        '_blank' // <- This is what makes it open in a new window.
      );
    } else if (term.policyDownloadPath) {
      var pdfUrl = `${environment.amazonS3}policy/${term.policyDownloadPath}`;//`${term.policyDownloadPath}`;

      // window.open(
      //   pdfUrl,
      //   '_blank' // <- This is what makes it open in a new window.
      // );
      // return;

      var pdfUrl = `${environment.amazonS3}policy/${term.policyDownloadPath}`;//`${term.policyDownloadPath}`;
      console.log('download path url :-', pdfUrl);
      if (this.isBrowser) {
        const link = document.createElement('a');
        link.setAttribute('href', pdfUrl);

        // Check if the user agent indicates iOS
        const isIOS =
          /iPad|iPhone|iPod/.test(navigator.userAgent) ||
          (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
        if (isIOS) {
          // window.open(pdfUrl, '_blank');
          link.setAttribute('target', '_self');
        } else {
          link.setAttribute('target', '_blank');
        }

        // link.setAttribute('download', response.path);
        // link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      // window.open(
      //   term.policyURL,
      //   '_blank' // <- This is what makes it open in a new window.
      // );
    } else if (term.policyURL) {

      window.open(
        term.policyURL,
        '_blank' // <- This is what makes it open in a new window.
      );
    }

    // this.router.navigate(['jobs/' + localStorage.getItem("clientShortCode") + "/policy-terms"])
  }

  getUrlPath(term: any) {
    return `${environment.amazonS3}policy/${term.policyDownloadPath}`;
  }
}
