export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  cantidad: number;
  usuarioRegistradorId?: number;
  confirmado?: boolean;
  listas?: number[];
  supermercado?: string;
}

export interface ProductoPropio {
  id: number;
  nombre: string;
  precioObjetivo?: number;
  notas?: string;
  listaId?: number;
  supermercado?: string;
  cantidad?: number;
}
