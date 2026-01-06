import { Component } from '@angular/core';
import { ResistorComponent } from './feature/resistor/resistor.component';

@Component({
  selector: 'app-root',
  imports: [ResistorComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
