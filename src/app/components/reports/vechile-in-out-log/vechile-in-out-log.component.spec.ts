// import { ComponentFixture, TestBed } from '@angular/core/testing';

// import { VechileInOutLogComponent } from './vechile-in-out-log.component';

// describe('VechileInOutLogComponent', () => {
//   let component: VechileInOutLogComponent;
//   let fixture: ComponentFixture<VechileInOutLogComponent>;

//   beforeEach(async () => {
//     await TestBed.configureTestingModule({
//       imports: [VechileInOutLogComponent]
//     })
//     .compileComponents();

//     fixture = TestBed.createComponent(VechileInOutLogComponent);
//     component = fixture.componentInstance;
//     fixture.detectChanges();
//   });

//   it('should create', () => {
//     expect(component).toBeTruthy();
//   });
// });


import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VehicleInOutLogComponent } from './vechile-in-out-log.component';

describe('VehicleInOutLogComponent', () => {
  let component: VehicleInOutLogComponent;
  let fixture: ComponentFixture<VehicleInOutLogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VehicleInOutLogComponent] // Correct class name
    }).compileComponents();

    fixture = TestBed.createComponent(VehicleInOutLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
