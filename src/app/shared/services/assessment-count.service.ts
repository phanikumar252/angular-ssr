import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

@Injectable({
  providedIn: 'root'
})
export class AssessmentCountService {

  private countSub = new BehaviorSubject<{count: number}>({
    count: 0});
  private totalSub = new BehaviorSubject<{total: number}>({
    total: 0
  });
  private assessTotalSub = new BehaviorSubject<{assessmentcount: number}>({
    assessmentcount: 0
  });
  assessmentCount = this.countSub.asObservable();
  assessmentTotalCount = this.totalSub.asObservable();
  assessmentTotalSubObject = this.assessTotalSub.asObservable();

  private goldBadge = new BehaviorSubject<{badge: boolean}>({
    badge: false
  });
  assessmentGoldBadge = this.goldBadge.asObservable();

  constructor() { }

  updateCount(count: number) {
    // if (count) {
      this.countSub.next({count});
      // localStorage.setItem('completedAssessments', count + '');
    // }
  }
  updateTotal(total: number) {
    // if (total) {
      this.totalSub.next({total});
      // localStorage.setItem('totalAssessments', total + '');
    // }
  }

  updateAssessBadge(badge: boolean) {
    // if (count) {
      this.goldBadge.next({badge});
      // localStorage.setItem('completedAssessments', count + '');
      // localStorage.setItem('totalAssessments', total + '');
    // }
  }

  updateAssessmentCount(assessmentcount: number) {
    // if (count) {
      this.assessTotalSub.next({assessmentcount});
      // localStorage.setItem('completedAssessments', count + '');
      // localStorage.setItem('totalAssessments', total + '');
    // }
  }
}
