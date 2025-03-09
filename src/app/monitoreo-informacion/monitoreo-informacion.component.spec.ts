import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonitoreoInformacionComponent } from './monitoreo-informacion.component';

describe('MonitoreoInformacionComponent', () => {
  let component: MonitoreoInformacionComponent;
  let fixture: ComponentFixture<MonitoreoInformacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonitoreoInformacionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MonitoreoInformacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
