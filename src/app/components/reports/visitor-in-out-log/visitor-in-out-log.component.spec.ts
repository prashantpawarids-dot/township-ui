import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisitorInOutLogComponent } from './visitor-in-out-log.component';

describe('VisitorInOutLogComponent', () => {
  let component: VisitorInOutLogComponent;
  let fixture: ComponentFixture<VisitorInOutLogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisitorInOutLogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VisitorInOutLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
