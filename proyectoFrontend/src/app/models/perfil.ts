export interface Perfil {
  idPerfil: number;
  usuarioId: number;
  nombrePerfil: string;
  descripcion: string;
  subtitulo?: string;
  fechaNacimiento?: string;
  edad?: string;
  residencia?: string;
  email?: string;
  telefono?: string;
  imagenUrl?: string;
}
