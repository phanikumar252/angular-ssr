import { TestBed } from '@angular/core/testing';

import { HtmlConvertionService } from './html-convertion.service';

describe('HtmlConvertionService', () => {
  let service: HtmlConvertionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HtmlConvertionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
