import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NrdcardtemplateComponent } from './nrdcardtemplate.component';

describe('NrdcardtemplateComponent', () => {
  let component: NrdcardtemplateComponent;
  let fixture: ComponentFixture<NrdcardtemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NrdcardtemplateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NrdcardtemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
