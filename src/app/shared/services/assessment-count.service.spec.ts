import { TestBed } from '@angular/core/testing';

import { AssessmentCountService } from './assessment-count.service';

describe('AssessmentCountService', () => {
  let service: AssessmentCountService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AssessmentCountService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
