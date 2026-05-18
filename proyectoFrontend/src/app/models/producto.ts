import { Comentario } from "./comentario";

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  usuarioRegistradorId?: number;
  confirmado?: boolean;
  listas?: number[];
  supermercado?: string;
  imagenUrl?: string;
  categoria?: string;
  comprado?: boolean;
  mediaPuntuacion?: number;
  totalComentarios?: number;
  nombreRegistrador?: string;
  comentarios?: Comentario[]
  puntuaciones?: number[];
}

export interface ProductoPropio {
  id: number;
  nombre: string;
  precioObjetivo?: number;
  notas?: string;
  listaId?: number;
  supermercado?: string;
  cantidad?: number;
  comprado?: boolean;
  usuarioId?: number;
}
