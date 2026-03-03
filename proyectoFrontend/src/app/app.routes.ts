// src/app/app.routes.ts
import { Routes } from '@angular/router';

import { ProductosComponent } from './components/productos/productos';
import { UsuariosComponent } from './components/usuarios/usuarios';
import { InicioComponent } from './components/inicio/inicio';
import { LoginComponent } from './components/login/login';
import { PerfilComponent } from './components/perfil/perfil';
import { BusquedaComponent } from './components/busqueda/busqueda';

export const routes: Routes = [
  { path: '', component: InicioComponent },
  { path: 'usuarios', component: UsuariosComponent },
  { path: 'productos', component: ProductosComponent },
  { path: 'login', component: LoginComponent },
  { path: 'perfil', component: PerfilComponent },
  { path: 'busqueda', component: BusquedaComponent }
];
