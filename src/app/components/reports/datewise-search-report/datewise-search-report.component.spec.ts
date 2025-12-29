import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatewiseSearchReportComponent } from './datewise-search-report.component';

describe('DatewiseSearchReportComponent', () => {
  let component: DatewiseSearchReportComponent;
  let fixture: ComponentFixture<DatewiseSearchReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DatewiseSearchReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DatewiseSearchReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
