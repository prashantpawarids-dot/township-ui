import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TagLostDamageComponent } from './tag-lost-damage.component';

describe('TagLostDamageComponent', () => {
  let component: TagLostDamageComponent;
  let fixture: ComponentFixture<TagLostDamageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TagLostDamageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TagLostDamageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
