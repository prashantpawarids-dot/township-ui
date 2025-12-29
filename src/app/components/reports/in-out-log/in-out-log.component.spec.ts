import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InOutLogComponent } from './in-out-log.component';

describe('InOutLogComponent', () => {
  let component: InOutLogComponent;
  let fixture: ComponentFixture<InOutLogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InOutLogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InOutLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
