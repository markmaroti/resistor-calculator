import { Routes } from '@angular/router';

export const appRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./feature/resistor/resistor.component').then((m) => m.ResistorComponent),
  },
  {
    path: 'guide',
    loadComponent: () =>
      import('./feature/guide/resistor-guide.component').then((m) => m.ResistorGuideComponent),
  },
  {
    path: 'tools',
    loadComponent: () =>
      import('./feature/circuit/circuit-tools.component').then((m) => m.CircuitToolsComponent),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
