// src/app/app.routes.ts
import { Routes } from '@angular/router';

import { ProductosComponent } from './components/productos/productos';
import { UsuariosComponent } from './components/usuarios/usuarios';
import { InicioComponent } from './components/inicio/inicio';
import { LoginComponent } from './components/login/login';
import { PerfilComponent } from './components/perfil/perfil';
import { BusquedaComponent } from './components/busqueda/busqueda';
import { ListaComponent } from './components/lista/lista';
import { ContactoComponent } from './components/contacto/contacto';
import { RegistroComponent } from './components/registro/registro';

export const routes: Routes = [
  { path: '', component: InicioComponent },
  { path: 'usuarios', component: UsuariosComponent },
  { path: 'productos', component: ProductosComponent },
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
  { path: 'perfil', component: PerfilComponent },
  { path: 'busqueda', component: BusquedaComponent },
  { path: 'mis-listas', component: ListaComponent },
  { path: 'contacto', component: ContactoComponent }
];
