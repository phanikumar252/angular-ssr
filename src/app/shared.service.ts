// shared.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SharedService {
  private userProfileSubject = new BehaviorSubject<{
    firstName: string;
    lastName: string;
  }>({ firstName: '', lastName: '' });
  private careerPageDisplay = new BehaviorSubject<{ status: Boolean }>({
    status: true,
  });
  private displayReferral = new BehaviorSubject<{ status: Boolean }>({
    status: true,
  });
  private clientShortCode = new BehaviorSubject<{ shortcode: string }>({
    shortcode: '',
  });
  private clientLogo = new BehaviorSubject<{ logo: string }>({ logo: '' });
  private clientSecondaryLogo = new BehaviorSubject<{ logo: string }>({
    logo: '',
  });
  private highVolume = new BehaviorSubject<{ status: Boolean }>({
    status: false,
  });
  private userProfilePicUpdate = new BehaviorSubject<{ profilePic: any }>({
    profilePic: '',
  });
  private miscellaneousColor = new BehaviorSubject<{ colorCode: string }>({
    colorCode: '',
  });
  private buttonColor = new BehaviorSubject<{ colorCode: string }>({
    colorCode: '',
  });
  private brandColor = new BehaviorSubject<{ colorCode: string }>({
    colorCode: '',
  });
  private banner = new BehaviorSubject<{ colorCode: string }>({
    colorCode: '',
  });

  private triggerLeftNgOnInitSource = new Subject<void>();

  triggerLeftNgOnInit$ = this.triggerLeftNgOnInitSource.asObservable();

  triggerLeftNgOnInit() {
    this.triggerLeftNgOnInitSource.next();
  }

  private triggerHeaderNgOnInitSource = new Subject<void>();

  triggerHeaderNgOnInit$ = this.triggerHeaderNgOnInitSource.asObservable();

  triggerHeaderNgOnInit() {
    this.triggerHeaderNgOnInitSource.next();
  }

  private triggerEmpLeftNgOnInitSource = new Subject<void>();

  triggerEmpLeftNgOnInit$ = this.triggerEmpLeftNgOnInitSource.asObservable();

  triggerEmpLeftNgOnInit() {
    this.triggerEmpLeftNgOnInitSource.next();
  }

  private triggerDashNgOnInitSource = new Subject<void>();

  triggerDashNgOnInit$ = this.triggerDashNgOnInitSource.asObservable();

  triggerDashNgOnInit() {
    this.triggerDashNgOnInitSource.next();
  }

  private triggerEditLeftNgOnInitSource = new Subject<void>();

  triggerEditLeftNgOnInit$ = this.triggerEditLeftNgOnInitSource.asObservable();

  triggerEditLeftNgOnInit() {
    this.triggerEditLeftNgOnInitSource.next();
  }

  // Observable to subscribe to changes
  userProfile$ = this.userProfileSubject.asObservable();

  updateProfile(newProfile: { firstName: string; lastName: string }): void {
    this.userProfileSubject.next(newProfile);
  }

  userProfilePic$ = this.userProfilePicUpdate.asObservable();
  userProfilePic(newUserProfile: { profilePic: any }): void {
    this.userProfilePicUpdate.next(newUserProfile);
  }

  // Observable to subscribe to changes
  userProfile1$ = this.careerPageDisplay.asObservable();

  updateStatus(newProfile: { status: Boolean }): void {
    this.careerPageDisplay.next(newProfile);
  }
  // Observable to subscribe to changes
  userReferral$ = this.displayReferral.asObservable();

  updateReferralStatus(newProfile: { status: Boolean }): void {
    this.displayReferral.next(newProfile);
  }

  // Observable to subscribe to changes
  clientCode$ = this.clientShortCode.asObservable();

  updateClientCode(newProfile: { shortcode: string }): void {
    this.clientShortCode.next(newProfile);
  }
  // clientSecondaryLogo
  // Observable to subscribe to changes
  clientLogo$ = this.clientLogo.asObservable();

  updateClientLogo(newProfile: { logo: string }): void {
    this.clientLogo.next(newProfile);
  }
  // Observable to subscribe to changes
  clientSecondaryLogo$ = this.clientSecondaryLogo.asObservable();

  updateClientSecondaryLogo(newProfile: { logo: string }): void {
    this.clientSecondaryLogo.next(newProfile);
  }
  // Observable to subscribe to changes
  miscellaneousColor$ = this.miscellaneousColor.asObservable();

  updateMiscellaneousColor(newProfile: { colorCode: string }): void {
    this.miscellaneousColor.next(newProfile);
  }
  // Observable to subscribe to changes
  buttonColor$ = this.buttonColor.asObservable();

  updateButtonColor(newProfile: { colorCode: string }): void {
    this.buttonColor.next(newProfile);
  }
  // Observable to subscribe to changes
  brandColor$ = this.brandColor.asObservable();

  updateBrandColor(newProfile: { colorCode: string }): void {
    this.brandColor.next(newProfile);
  }

  // Observable to subscribe to changes
  banner$ = this.banner.asObservable();

  updateBanner(newProfile: { colorCode: string }): void {
    this.banner.next(newProfile);
  }
  // Observable to subscribe to changes
  highVolume$ = this.highVolume.asObservable();

  updateHighVolume(newProfile: { status: Boolean }): void {
    this.highVolume.next(newProfile);
  }
}
