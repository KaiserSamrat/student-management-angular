import { TestBed } from '@angular/core/testing';

import { StudentResolverService } from './student-resolver.service';

describe('StudentResolverService', () => {
  let service: StudentResolverService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StudentResolverService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
