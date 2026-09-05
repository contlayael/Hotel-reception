import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalCheckin } from './modal-checkin';

describe('ModalCheckin', () => {
  let component: ModalCheckin;
  let fixture: ComponentFixture<ModalCheckin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalCheckin],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalCheckin);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
