import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MasterReportComponent } from './master-report.component';

describe('MasterReportComponent', () => {
  let component: MasterReportComponent;
  let fixture: ComponentFixture<MasterReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MasterReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MasterReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
