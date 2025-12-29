import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VechileListComponent } from './vechile-list.component';

describe('VechileListComponent', () => {
  let component: VechileListComponent;
  let fixture: ComponentFixture<VechileListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VechileListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VechileListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
