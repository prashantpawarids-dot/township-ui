import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNewProfileComponent } from './add-new-profile.component';

describe('AddNewProfileComponent', () => {
  let component: AddNewProfileComponent;
  let fixture: ComponentFixture<AddNewProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddNewProfileComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddNewProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
