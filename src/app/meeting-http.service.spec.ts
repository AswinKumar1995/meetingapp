import { TestBed } from '@angular/core/testing';

import { MeetingHttpService } from './meeting-http.service';

describe('MeetingHttpService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MeetingHttpService = TestBed.get(MeetingHttpService);
    expect(service).toBeTruthy();
  });
});
