import { TestBed } from '@angular/core/testing';

import { HtmlToPdfConvertionService } from './html-to-pdf-convertion.service';

describe('HtmlToPdfConvertionService', () => {
  let service: HtmlToPdfConvertionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HtmlToPdfConvertionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
