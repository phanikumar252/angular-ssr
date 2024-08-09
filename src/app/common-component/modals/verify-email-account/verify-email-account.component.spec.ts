import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerifyEmailAccountComponent } from './verify-email-account.component';

describe('VerifyEmailAccountComponent', () => {
  let component: VerifyEmailAccountComponent;
  let fixture: ComponentFixture<VerifyEmailAccountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VerifyEmailAccountComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VerifyEmailAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
