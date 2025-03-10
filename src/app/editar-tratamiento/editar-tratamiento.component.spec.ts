import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarTratamientoComponent } from './editar-tratamiento.component';

describe('EditarTratamientoComponent', () => {
  let component: EditarTratamientoComponent;
  let fixture: ComponentFixture<EditarTratamientoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarTratamientoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarTratamientoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
