import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgreementEndReportComponent } from './agreement-end-report.component';

describe('AgreementEndReportComponent', () => {
  let component: AgreementEndReportComponent;
  let fixture: ComponentFixture<AgreementEndReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgreementEndReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgreementEndReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
