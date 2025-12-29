import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TagBlockRemoveComponent } from './tag-block-remove.component';

describe('TagBlockRemoveComponent', () => {
  let component: TagBlockRemoveComponent;
  let fixture: ComponentFixture<TagBlockRemoveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TagBlockRemoveComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TagBlockRemoveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
