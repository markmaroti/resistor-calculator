import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectComponent } from './select.component';

describe('SelectComponent', () => {
  let component: SelectComponent<string>;
  let fixture: ComponentFixture<SelectComponent<string>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SelectComponent) as ComponentFixture<SelectComponent<string>>;
    component = fixture.componentInstance;

    fixture.componentRef.setInput('label', 'Label');
    fixture.componentRef.setInput('options', ['a', 'b', 'c']);
    fixture.componentRef.setInput('value', 'a');
    
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
