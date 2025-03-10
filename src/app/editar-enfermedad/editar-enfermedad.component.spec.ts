import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarEnfermedadComponent } from './editar-enfermedad.component';

describe('EditarEnfermedadComponent', () => {
  let component: EditarEnfermedadComponent;
  let fixture: ComponentFixture<EditarEnfermedadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarEnfermedadComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarEnfermedadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
