import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuiasIndividualComponent } from './guias-individual.component';

describe('GuiasIndividualComponent', () => {
  let component: GuiasIndividualComponent;
  let fixture: ComponentFixture<GuiasIndividualComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GuiasIndividualComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GuiasIndividualComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
