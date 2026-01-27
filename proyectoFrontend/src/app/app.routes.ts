// src/app/app.routes.ts
import { Routes } from '@angular/router';

import { ProductosComponent } from './components/productos/productos';
import { UsuariosComponent } from './components/usuarios/usuarios';

export const routes: Routes = [
  { path: '', component: UsuariosComponent },
  { path: 'productos', component: ProductosComponent }
];
