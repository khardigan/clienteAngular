import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProductoService } from '../../services/producto';
import { Producto } from '../../models/producto';

describe('ProductoService', () => {
  let service: ProductoService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProductoService]
    });

    service = TestBed.inject(ProductoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should list productos', () => {
    const dummyProductos: Producto[] = [
      { id: 1, nombre: 'Producto 1', descripcion: 'Desc 1', precio: 10, cantidad: 5 },
      { id: 2, nombre: 'Producto 2', descripcion: 'Desc 2', precio: 20, cantidad: 3 }
    ];

    service.listarProductos().subscribe(prods => {
      expect(prods.length).toBe(2);
      expect(prods).toEqual(dummyProductos);
    });

    const req = httpMock.expectOne('http://localhost:8080/productos');
    expect(req.request.method).toBe('GET');
    req.flush(dummyProductos);
  });
});
