import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuestInOutLogComponent } from './guest-in-out-log.component';

describe('GuestInOutLogComponent', () => {
  let component: GuestInOutLogComponent;
  let fixture: ComponentFixture<GuestInOutLogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GuestInOutLogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GuestInOutLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
