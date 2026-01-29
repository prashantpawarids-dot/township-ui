import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VechileEncodingLogComponent } from './vechile-encoding-log.component';

describe('VechileEncodingLogComponent', () => {
  let component: VechileEncodingLogComponent;
  let fixture: ComponentFixture<VechileEncodingLogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VechileEncodingLogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VechileEncodingLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
