import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplyJobsResumeComponent } from './apply-jobs-resume.component';

describe('ApplyJobsResumeComponent', () => {
  let component: ApplyJobsResumeComponent;
  let fixture: ComponentFixture<ApplyJobsResumeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ApplyJobsResumeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplyJobsResumeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
