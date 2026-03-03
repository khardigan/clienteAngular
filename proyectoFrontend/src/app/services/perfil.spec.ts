import { TestBed } from '@angular/core/testing';

import { PerfilComponent } from '../components/perfil/perfil';

describe('Perfil', () => {
  let service: PerfilComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PerfilComponent);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
