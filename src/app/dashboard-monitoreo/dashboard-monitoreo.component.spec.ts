import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardMonitoreoComponent } from './dashboard-monitoreo.component';

describe('DashboardMonitoreoComponent', () => {
  let component: DashboardMonitoreoComponent;
  let fixture: ComponentFixture<DashboardMonitoreoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardMonitoreoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardMonitoreoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
