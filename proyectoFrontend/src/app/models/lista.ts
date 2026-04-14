// Representa la información básica de un usuario (para listas compartidas)
export interface UsuarioMinimo {
    id: number;
    nick: string;
}

// Representa el estado de un producto dentro de una lista específica
export interface ProductoEstado {
    id: number;
    nombre: string;
    precio: number;
    cantidad: number;
    comprado: boolean; // Indica si el producto ya ha sido tachado de la lista
}

// Interfaz detallada de una lista de la compra con todos sus datos
export interface ListaDetalle {
    codLista: number;
    usuarioDuenoId: number;
    nombreDuenoNick: string;
    usuariosCompartida: UsuarioMinimo[]; // Usuarios con los que se ha compartido la lista
    productos: ProductoEstado[]; // Listado de productos incluidos
    total?: number; // Total opcional (calculado en el frontend)
}

// Estructura auxiliar para mostrar los integrantes en la UI de forma unificada
export interface IntegranteLista {
    id: number;
    nick: string;
    esDueno: boolean;
}
