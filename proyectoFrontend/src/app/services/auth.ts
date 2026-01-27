import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  // Aquí pones tu token hardcodeado (temporal para pruebas)
  token = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiIsInJvbCI6IkFETUlOIiwiaWQiOjEsImlhdCI6MTc2OTUyNzE2MSwiZXhwIjoxNzY5NTMwNzYxfQ.gfk5fgiuy91aSmUSbPueYBgNsf5dxvEaS7Irf0914Q4';

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${this.token}`
      }
    });
    return next.handle(authReq);
  }
}
