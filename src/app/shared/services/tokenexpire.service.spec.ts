import { TestBed } from '@angular/core/testing';

import { TokenexpireService } from './tokenexpire.service';

describe('TokenexpireService', () => {
  let service: TokenexpireService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TokenexpireService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
