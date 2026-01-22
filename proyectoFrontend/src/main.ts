import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app'; // asegúrate de la ruta correcta

bootstrapApplication(App)
  .catch(err => console.error(err));
