import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgregarEnfermedadComponent } from './agregar-enfermedad.component';

describe('AgregarEnfermedadComponent', () => {
  let component: AgregarEnfermedadComponent;
  let fixture: ComponentFixture<AgregarEnfermedadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgregarEnfermedadComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgregarEnfermedadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
