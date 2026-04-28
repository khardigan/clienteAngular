import { Usuario } from "./usuario";

export interface Comentario {
    id: number;
    contenido: string;
    fecha: string | Date;
    puntuacion: number;
    usuario: Usuario;
    editando?: boolean;
    idProducto?: number;
    productoId?: number;
    productoNombre?: string;
    idUsuario?: number;
}