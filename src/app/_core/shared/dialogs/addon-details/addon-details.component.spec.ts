import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddonDetailsComponent } from './addon-details.component';

describe('AddonDetailsComponent', () => {
  let component: AddonDetailsComponent;
  let fixture: ComponentFixture<AddonDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddonDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddonDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
