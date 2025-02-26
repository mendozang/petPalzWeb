import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MascotaDetallesComponent } from './mascota-detalles.component';

describe('MascotaDetallesComponent', () => {
  let component: MascotaDetallesComponent;
  let fixture: ComponentFixture<MascotaDetallesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MascotaDetallesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MascotaDetallesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
