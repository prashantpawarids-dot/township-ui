import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractorEmployeeComponent } from './contractor-employee.component';

describe('ContractorEmployeeComponent', () => {
  let component: ContractorEmployeeComponent;
  let fixture: ComponentFixture<ContractorEmployeeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContractorEmployeeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContractorEmployeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
