import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContratorTypeComponent } from './contrator-type.component';

describe('ContratorTypeComponent', () => {
  let component: ContratorTypeComponent;
  let fixture: ComponentFixture<ContratorTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContratorTypeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContratorTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
