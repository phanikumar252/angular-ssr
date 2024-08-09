import {
  Component, Inject,
  PLATFORM_ID
} from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { Location, isPlatformBrowser } from '@angular/common';
import { Emitters } from 'src/app/class/emitters/emitters';
import { UserAuthService } from 'src/app/user-auth.service';
import { environment } from 'src/environments/environment';
import { AssessmentCountService } from './shared/services/assessment-count.service';
import { SharedService } from './shared.service';

declare let gtag: Function;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  private isBrowser: boolean = true;
  jsonData = {
    buttonColor: '',
    brandColorColor: ''
  }
  highVolume: Boolean = false;

  title = 'website1';
  year = new Date().getFullYear();
  isHome: any;
  dashboardReached = false;
  authenticated: any;
  profilePreview = false;
  viewprofile = false;
  assessmentPreview = false;
  footerDisplay = false;
  findJobs = false;
  bmsFindJobs = false;
  elevanceFindJobs = false;
  userToken: any;
  showLeftMenuForThanksApply = true;
  showLeftMenuForJoining = false;
  currentUrl: any;
  showSpinner = false;

  isShowLeftHeader = false;
  // highVolume = false
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    private userService: UserAuthService,
    private countChange: AssessmentCountService,
    private sharedService: SharedService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {

    this.isBrowser = isPlatformBrowser(this.platformId);
    if (this.isBrowser) {
      if (localStorage.getItem("highVolume") && localStorage.getItem("highVolume") === "true") {
        this.highVolume = true
      }
    }

    if (environment.googleAnalyticsKey && this.isBrowser) {
      // register google tag manager
      const gTagManagerScript = document.createElement('script');
      gTagManagerScript.async = true;
      gTagManagerScript.src = `https://www.googletagmanager.com/gtag/js?id=${environment.googleAnalyticsKey}`;
      document.head.appendChild(gTagManagerScript);

      // register google analytics
      const gaScript = document.createElement('script');
      gaScript.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag() { dataLayer.push(arguments); }
        gtag('js', new Date());
      `;
      // gtag('config', '${environment.googleAnalyticsKey}');
      document.head.appendChild(gaScript);
    }
    if (this.isBrowser) {
      if (window.location.pathname.split('/').includes('create-upload-resume')) {
        this.isShowLeftHeader = true
      }
    }
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.currentUrl = this.router.url;
        console.log(this.router.url);

        console.log(2222);
        this.isHome = this.router.url == '/home' ? true : false;
        this.userToken = this.userService.getUserType();
        this.dashboardReached =
          this.router.url.indexOf('/dashboard') !== -1 ||
            this.router.url.indexOf('/settings') !== -1 ||
            this.router.url.indexOf('/notification-settings') !== -1 ||
            this.router.url.indexOf('/data-privacy-settings') !== -1 ||
            this.router.url.indexOf('/connections') !== -1 ||
            this.router.url.indexOf('/profile') !== -1 ||
            this.router.url.indexOf('/view-profile') !== -1 ||
            this.router.url.indexOf('/alljobs') !== -1 ||
            this.router.url.indexOf('/preference') !== -1 ||
            this.router.url.indexOf('/already-applied') !== -1 ||
            this.router.url.indexOf('/thankyou-for-apply') !== -1 ||
            this.router.url.indexOf('/continue-apply') !== -1 ||
            this.router.url.indexOf('/assessments') !== -1
            ? true
            : false;

        if (this.userService.isUserLoggedIn()) {
          this.dashboardReached = this.dashboardReached ||
            this.router.url.indexOf('/thanks-for-applying') !== -1 ||
            this.router.url.indexOf('/thanks-for-joining') !== -1
        }


        if (
          this.router.url.indexOf('/thanks-for-applying') !== -1
          ||
          this.router.url.indexOf('/already-applied') !== -1
        ) {
          if (this.userToken == 'true' && !this.highVolume) {
            this.showLeftMenuForThanksApply = true;
          } else {
            this.showLeftMenuForThanksApply = false;
          }
        } else {
          if (
            this.router.url.indexOf('/login') !== -1 ||
            this.router.url.indexOf('/reset') !== -1 ||
            this.router.url.indexOf('/signup') !== -1 ||
            this.router.url.indexOf('/forgot') !== -1
          ) {
            if (this.isBrowser)
              localStorage.removeItem('isAlreadyOldUser');
          }
          this.showLeftMenuForThanksApply = true;
        }
        if (this.router.url.indexOf('/thanks-for-joining') !== -1) {
          this.showLeftMenuForJoining = true;
        }
        this.footerDisplay =
          this.router.url.indexOf('/login') !== -1 ||
            this.router.url.indexOf('/forgot-password') !== -1 ||
            this.router.url.indexOf('/signup') !== -1 ||
            this.router.url.indexOf('/reset') !== -1
            ? true
            : false;
        //console.log(this.isHome)
        this.profilePreview = this.router.url.indexOf('/preview') !== -1;
        this.viewprofile = this.router.url.indexOf('/view-profile') !== -1;
        this.assessmentPreview =
          (this.router.url.indexOf('/assessment') !== -1 &&
            this.router.url.split('?')[0].length == 11) || (this.router.url.indexOf('/redirectassessment') !== -1);
        this.findJobs = (this.router.url.indexOf('/find-jobs') !== -1);
        this.bmsFindJobs = (this.router.url.indexOf('/bms-find-jobs') !== -1);
        this.elevanceFindJobs = this.router.url.indexOf('/elevance-find-jobs') !== -1;
        console.log(this.router.url);
        if (this.isBrowser) {
          let isCareerPage = window.location.href.split("/");

          let x: HTMLElement | null = document.getElementById('iFrameDiv');
          if (window.location.href.includes("/jobs") && isCareerPage.length == 5) {
            this.findJobs = true;
            // console.log(x)
            // if(window.location.pathname.indexOf('find-jobs') != '-1'){
            if (this.isBrowser) {
              let chtbtStatus = localStorage.getItem("showchatbot");
              if (chtbtStatus && chtbtStatus == "true") {
                x ? x.style.display = 'block' : '';

              }
            }
            // if (event.data == true) {
            //     x.style.height = '80vh';
            // } 

            // } else {
            //     x.style.display = 'none';
            // }

          } else {
            this.findJobs = false;
            x ? x.style.display = 'none' : '';

          }
        }
        // gtag('set', 'page', this.router.url);
        // gtag('send', 'pageview');
        // gtag('send', 'pageview', {
        //   'page': 'anil',
        //   'title': 'anil'
        // });
        // Dev : G-F5B7WQR6RD
        // Prod : G-VYXFFHNN9S

        if (environment.googleAnalyticsKey) {
          console.log(environment.googleAnalyticsKey);
          gtag('config', environment.googleAnalyticsKey, {
            page_title: this.router.url,
            page_path: this.router.url,
          });
        }
      }
    });
  }
  onActivate(e: any, outlet: any) {
    // setTimeout(() => {
    // outlet.scrollTop = 0;
    // window.scroll(0,0);
    // }, 0);
  }

  setDynamicColor() {
    if (this.isBrowser) {
      const dynamicButtonColor = this.jsonData.buttonColor; // Assuming you want to use the color of the first item
      document.documentElement.style.setProperty('--dynamic-button-color', dynamicButtonColor);
      const dynamicBrandColorColor = this.jsonData.brandColorColor; // Assuming you want to use the color of the first item
      document.documentElement.style.setProperty('--dynamic-brand-color', dynamicBrandColorColor);
    }
  }



  setBackground() {
    if (this.isBrowser) {
      const path = window.location.pathname;
      const BackgroundPages = [
        'dashboard',
        'profile',
        'preference',
        'alljobs',
        'connections'
      ];
      const isMatch = BackgroundPages.some(page => path.includes(page));
      const isMaxWidth = window.innerWidth > 1490

      if (isMatch && isMaxWidth) {
        if (this.isBrowser)
          document.body.style.backgroundColor = '#F3F5F7';
      } else {
        if (this.isBrowser)
          document.body.style.backgroundColor = '';
      }
    }
  }

  ngOnInit(): void {

    this.setBackground();
    if (this.isBrowser) {
      localStorage.removeItem("jobOpen");
    }
    this.sharedService.highVolume$.subscribe(({ status }) => {
      console.log('Received highvolume status:', status);
      this.highVolume = status;
    });
    if (this.isBrowser) {

      window.addEventListener('resize', () => {
        this.setBackground();
      });
    }

    // Subscribe to router events
    // this.router.events.subscribe((event) => {
    //   if (event instanceof NavigationEnd) {
    //     this.setBackground(); // Call setBackground() when navigation ends
    //   }
    // });


    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {

        console.log(111111);
        let currUrl = this.location.path();
        let ary1 = currUrl.split("/find-jobs");
        // if(!ary1.length){
        let ary77 = currUrl.split("/bms-find-jobs");
        let ary88 = currUrl.split("/elevance-find-jobs");
        let ary99 = currUrl.split("/jobs/");
        let urlLength = currUrl.split("/");
        // }
        console.log(ary1);
        console.log("ary1");
        if (ary77 && ary77.length == 2) {
          ary1 = ary77;

        }
        if (ary88 && ary88.length == 2) {
          ary1 = ary88;

        }
        if (ary99 && ary99.length == 2) {
          ary1 = ary99;

        }
        if (ary99 && ary99.length == 2) {
          let ary2 = ary99;
          console.log(ary2);
          console.log("ary2");
          let findChatBotType = ary99[1].indexOf("type=");
          if (findChatBotType !== -1) {
            let ary3 = ary99[1].split("type=");
            console.log(ary3);
            console.log("ary3");
            if (ary3 && ary3.length) {
              if (this.isBrowser)
                localStorage.setItem("chatbotType", ary3[1])
            }
          } else {
            if (this.isBrowser)
              localStorage.setItem("chatbotType", "1")

          }
          if (ary2 && ary2.length == 2 && urlLength.length == 3) {
            if (this.isBrowser)
              localStorage.setItem("clientShortCode", ary2[1]);
          }

        } else if ((ary1 && ary1.length == 2)) {
          let ary2 = ary1[0].split("/jobs/");
          console.log(ary2);
          console.log("ary2");
          let findChatBotType = ary1[1].indexOf("type=");
          if (findChatBotType !== -1) {
            let ary3 = ary1[1].split("type=");
            console.log(ary3);
            console.log("ary3");
            if (ary3 && ary3.length) {
              if (this.isBrowser)
                localStorage.setItem("chatbotType", ary3[1])
            }
          } else {
            if (this.isBrowser)
              localStorage.setItem("chatbotType", "1")

          }
          if (ary2 && ary2.length == 2 && urlLength.length == 3) {
            if (this.isBrowser)
              localStorage.setItem("clientShortCode", ary2[1]);
          }

        }

      }
    });



    // this.getcategorylist();
    if (this.isBrowser) {
      if (localStorage.getItem('completedAssessments')) {
        this.countChange.updateCount(
          Number(localStorage.getItem('completedAssessments'))
        );
        this.countChange.updateCount(
          Number(localStorage.getItem('totalAssessments'))
        );
      }
    }
    Emitters.authEmitter.subscribe((auth: boolean) => {
      this.authenticated = auth;
    });

  }

  getNotification(event: Event) {
    alert(123);
  }
}
