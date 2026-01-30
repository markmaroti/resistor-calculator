import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { ResistorComponent } from './resistor.component';

describe('ResistorComponent', () => {
  let component: ResistorComponent;
  let fixture: ComponentFixture<ResistorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResistorComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ResistorComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
