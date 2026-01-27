export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  cantidad: number;
  usuarioRegistradorId?: number;
  confirmado?: boolean;
  listas?: number[];
}
