import { ProductoPropio } from "./producto";

export interface UsuarioMinimo {
    id: number;
    nick: string;
    imagenUrl?: string;
}

export interface ProductoEstado {
    id: number;
    nombre: string;
    precio: number;
    cantidad: number;
    comprado: boolean; // Indica si el producto ya ha sido tachado de la lista
    supermercado?: string;
}

// Interfaz detallada de una lista de la compra con todos sus datos
export interface ListaDetalle {
    codLista: number;
    usuarioDuenoId: number;
    nombreDuenoNick: string;
    imagenDuenoUrl?: string;
    usuariosCompartida: UsuarioMinimo[];
    productos: ProductoEstado[];
    productoPropios: ProductoPropio[];
    nombre: string;
    publicada: boolean;
    codigo?: string;
    total?: number; // calculado en el frontend
}

export interface IntegranteLista {
    id: number;
    nick: string;
    esDueno: boolean;
    imagenUrl?: string;
}
