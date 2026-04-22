// src/app/app.routes.ts
import { Routes } from '@angular/router';

import { ProductosComponent } from './components/productos/productos';
import { UsuariosComponent } from './components/usuarios/usuarios';
import { InicioComponent } from './components/inicio/inicio';
import { LoginComponent } from './components/login/login';
import { PerfilComponent } from './components/perfil/perfil';
import { ListaComponent } from './components/lista/lista';
import { ContactoComponent } from './components/contacto/contacto';
import { RegistroComponent } from './components/registro/registro';
import { FichaProductoComponent } from './components/ficha-producto/ficha-producto';
import { ListasPublicasComponent } from './components/listas-publicas/listas-publicas';
import { adminGuard } from './guards/admin.guard';
import { AdministrarProductosComponent } from './components/administrarProductos/administrarProductos';

export const routes: Routes = [
  { path: '', component: InicioComponent },
  { path: 'usuarios', component: UsuariosComponent, canActivate: [adminGuard] },
  { path: 'productos', component: ProductosComponent },
  { path: 'productos/:id', component: FichaProductoComponent },
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
  { path: 'perfil', component: PerfilComponent },
  { path: 'mis-listas', component: ListaComponent },
  { path: 'comunidad', component: ListasPublicasComponent },
  { path: 'contacto', component: ContactoComponent },
  { path: 'administrarProductos', component: AdministrarProductosComponent, canActivate: [adminGuard] }
];
