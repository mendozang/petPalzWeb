import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonitoreoSaludComponent } from './monitoreo-salud.component';

describe('MonitoreoSaludComponent', () => {
  let component: MonitoreoSaludComponent;
  let fixture: ComponentFixture<MonitoreoSaludComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonitoreoSaludComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MonitoreoSaludComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
