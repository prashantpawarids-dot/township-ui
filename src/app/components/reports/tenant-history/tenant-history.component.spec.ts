import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TenantHistoryComponent } from './tenant-history.component';

describe('TenantHistoryComponent', () => {
  let component: TenantHistoryComponent;
  let fixture: ComponentFixture<TenantHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TenantHistoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TenantHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
