import { TestBed } from '@angular/core/testing';

import { RemoveJunkTextService } from './remove-junk-text.service';

describe('RemoveJunkTextService', () => {
  let service: RemoveJunkTextService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RemoveJunkTextService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
