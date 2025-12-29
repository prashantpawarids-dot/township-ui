import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TagBlockRevokeComponent } from './tag-block-revoke.component';

describe('TagBlockRevokeComponent', () => {
  let component: TagBlockRevokeComponent;
  let fixture: ComponentFixture<TagBlockRevokeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TagBlockRevokeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TagBlockRevokeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
