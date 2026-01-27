export interface Usuario {
    id: number;
    nombre: string;
    email: string;
    fechaRegistro: string;
    idPerfil: number;
    rol: string;
    listaProductosSubidos: any[];
    listasCompartidas: any[];
    listasCreadas: any[];
}
