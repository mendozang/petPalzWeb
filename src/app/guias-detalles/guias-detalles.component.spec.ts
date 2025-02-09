import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuiasDetallesComponent } from './guias-detalles.component';

describe('GuiasDetallesComponent', () => {
  let component: GuiasDetallesComponent;
  let fixture: ComponentFixture<GuiasDetallesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GuiasDetallesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GuiasDetallesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
