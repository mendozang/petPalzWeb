import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VeterinariosDetallesComponent } from './veterinarios-detalles.component';

describe('VeterinariosDetallesComponent', () => {
  let component: VeterinariosDetallesComponent;
  let fixture: ComponentFixture<VeterinariosDetallesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VeterinariosDetallesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VeterinariosDetallesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
