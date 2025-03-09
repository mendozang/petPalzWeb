import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonitoreoHistorialComponent } from './monitoreo-historial.component';

describe('MonitoreoHistorialComponent', () => {
  let component: MonitoreoHistorialComponent;
  let fixture: ComponentFixture<MonitoreoHistorialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonitoreoHistorialComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MonitoreoHistorialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
