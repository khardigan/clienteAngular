import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ListaService } from '../../services/lista';
import { ProductoService } from '../../services/producto';
import { AuthService } from '../../services/auth';
import { ListaDetalle, IntegranteLista, ProductoEstado } from '../../models/lista';
import { ProductoPropio, Producto } from '../../models/producto';
import { finalize } from 'rxjs';

/**
 * Componente principal que gestiona:
 * - Listas del usuario
 * - Productos oficiales y propios
 * - Acciones como crear, borrar, compartir, etc.
 */
@Component({
    selector: 'app-lista',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './lista.html',
    styleUrls: ['./lista.css']
})
export class ListaComponent implements OnInit {

    // ===================== ESTADO GENERAL =====================

    listas: ListaDetalle[] = []; // Listas del usuario
    cargando = true; // Control de spinner
    errorStr = ''; // Mensaje de error general

    // ===================== PRODUCTOS PROPIOS =====================

    productosPropios: ProductoPropio[] = []; // Productos creados por el usuario
    panelPropioAbiertoEnLista: number | null = null; // Qué lista tiene abierto el panel
    mostrarFormNuevo = false; // Mostrar formulario crear producto

    nuevoProducto = {
        nombre: '',
        precioObjetivo: undefined as number | undefined,
        notas: '',
        supermercado: ''
    };

    guardando = false; // Estado loading al crear producto

    // ===================== PRODUCTOS OFICIALES =====================

    panelOficialAbiertoEnLista: number | null = null;
    busquedaProducto = '';
    resultadosBusqueda: Producto[] = [];
    buscando = false;

    // ===================== FEEDBACK =====================

    feedbackMsg = '';
    feedbackTipo: 'success' | 'danger' = 'success';
    private feedbackTimer: any = null;

    // ===================== CABECERA =====================

    panelCrearAbierto = false;
    panelUnirseAbierto = false;
    inputNombreLista = '';
    inputCodigoUnirse = '';
    procesandoAccion = false;
    searchTimer: number | undefined;

    confirmandoModificarNombreListaId: number | null = null;
    inputNuevoNombre = '';

    confirmandoBorradoListaId: number | null = null;

    constructor(
        private listaService: ListaService,
        private productoService: ProductoService,
        private authService: AuthService,
        private cdr: ChangeDetectorRef // Fuerza actualización manual de la vista
    ) { }

    /**
     * Hook inicial del componente
     * - Carga listas
     * - Carga productos propios
     */
    ngOnInit(): void {
        this.cargarListas();
        this.cargarProductosPropios();
    }

    // ===================== ORDENACIÓN =====================

    /**
     * Devuelve las listas ordenadas:
     * - Primero las NO completadas
     * - Después las completadas
     */
    get listasOrdenadas(): ListaDetalle[] {
        return [...this.listas].sort((a, b) => {
            const aComp = this.estaListaCompletada(a) ? 1 : 0;
            const bComp = this.estaListaCompletada(b) ? 1 : 0;
            return aComp - bComp;
        });
    }

    /**
     * Prepara UI para modificar nombre
     */
    prepararModificarNombre(lista: ListaDetalle): void {
        this.confirmandoModificarNombreListaId = lista.codLista;
        this.inputNuevoNombre = lista.nombre || '';
    }

    cancelarModificarNombre(): void {
        this.confirmandoModificarNombreListaId = null;
        this.inputNuevoNombre = '';
    }

    prepararBorradoLista(listaId: number): void {
        this.confirmandoBorradoListaId = listaId;
    }

    cancelarBorradoLista(): void {
        this.confirmandoBorradoListaId = null;
    }

    /**
     * Indica si una lista está completamente comprada
     */
    estaListaCompletada(lista: ListaDetalle): boolean {
        return lista.productos.length > 0 &&
            lista.productos.every(p => p.comprado);
    }

    /**
     * Indica si una lista puede publicarse
     * - No debe tener productos propios
     * - No debe estar ya publicada
     */
    puedePubilcar(lista: ListaDetalle): boolean {
        const tienePropios = lista.productoPropios && lista.productoPropios.length > 0;
        return !tienePropios && !lista.publicada;
    }

    // ===================== CARGA DATOS =====================

    /**
     * Obtiene listas del usuario
     * Servicio devuelve: Observable<ListaDetalle[]>
     */
    cargarListas(): void {
        this.cargando = true;

        this.listaService.obtenerMisListas().subscribe({
            next: (data) => {
                setTimeout(() => {
                    this.listas = data || [];
                    this.cargando = false;
                    this.cdr.detectChanges();
                }, 600);
            },
            error: () => {
                this.errorStr = 'No se pudieron cargar tus listas.';
                this.cargando = false;
                this.cdr.detectChanges();
            }
        });
    }

    /**
     * Obtiene productos propios del usuario
     * Servicio devuelve: Observable<ProductoPropio[]>
     */
    cargarProductosPropios(): void {
        const usuarioId = this.authService.getId();
        if (!usuarioId) return;

        this.productoService
            .listarProductosPropiosDeUsuario(usuarioId)
            .subscribe({
                next: (data) => {
                    this.productosPropios = data || [];
                    this.cdr.detectChanges();
                },
                error: () => {
                    this.productosPropios = [];
                }
            });
    }

    // ===================== PRODUCTOS PROPIOS =====================

    /**
     * Abre/cierra panel de productos propios
     */
    togglePanelProductoPropio(codLista: number): void {
        if (this.panelPropioAbiertoEnLista === codLista) {
            this.panelPropioAbiertoEnLista = null;
            this.mostrarFormNuevo = false;
        } else {
            this.panelPropioAbiertoEnLista = codLista;
            this.panelOficialAbiertoEnLista = null;
            this.mostrarFormNuevo = false;
            this.resetFormNuevo();
        }
    }

    /**
     * Elimina producto propio de la BD
     * Servicio devuelve: Observable<void>
     */
    eliminarProductoPropio(productoId: number, event: MouseEvent): void {
        event.stopPropagation();

        this.productoService.eliminarProductoPropio(productoId).subscribe({
            next: () => {
                this.cargarProductosPropios();
                this.cargarListas();
            },
            error: () => {
                this.errorStr = 'No se pudo eliminar el producto propio.';
                this.cdr.detectChanges();
            }
        });
    }

    /**
     * Quita producto de la lista (no lo elimina de BD)
     */
    quitarDeListaPropio(producto: ProductoPropio, event: MouseEvent): void {
        event.stopPropagation();

        this.productoService.actualizarProductoPropio(producto.id, {
            nombre: producto.nombre,
            precioObjetivo: producto.precioObjetivo,
            notas: producto.notas,
            listaId: null,
            supermercado: producto.supermercado,
            cantidad: producto.cantidad
        }).subscribe({
            next: () => this.cargarListas(),
            error: () => {
                this.errorStr = 'No se pudo quitar el producto de la lista.';
                this.cdr.detectChanges();
            }
        });
    }

    /**
 * Elimina un producto oficial de la lista (NO del catálogo global)
 * Servicio devuelve: Observable<void>
 */
    eliminarProducto(lista: ListaDetalle, producto: ProductoEstado, event: MouseEvent): void {
        event.stopPropagation();

        // Generamos nueva lista de IDs sin el producto eliminado
        const newIds = lista.productos
            .filter(p => p.id !== producto.id)
            .map(p => p.id);

        // IDs de usuarios compartidos
        const usuariosIds = lista.usuariosCompartida
            ? lista.usuariosCompartida.map(u => u.id)
            : [];

        this.listaService.actualizarLista(lista.codLista, {
            productosEnLista: newIds,
            usuariosCompartida: usuariosIds
        }).subscribe({
            next: () => this.cargarListas(),
            error: () => {
                this.errorStr = 'No se pudo quitar el producto de la lista.';
                this.cdr.detectChanges();
            }
        });
    }

    /**
     * Añade un producto propio existente a una lista
     */
    agregarProductoPropioALista(lista: ListaDetalle, producto: ProductoPropio): void {
        this.productoService.actualizarProductoPropio(producto.id, {
            nombre: producto.nombre,
            precioObjetivo: producto.precioObjetivo,
            notas: producto.notas,
            listaId: lista.codLista,
            supermercado: producto.supermercado,
            cantidad: 1
        }).subscribe({
            next: () => {
                this.panelPropioAbiertoEnLista = null;
                this.cargarListas();
            },
            error: () => {
                this.errorStr = 'No se pudo añadir el producto a la lista.';
                this.cdr.detectChanges();
            }
        });
    }

    /**
     * Cambia cantidad de producto oficial
     * Servicio devuelve: Observable<void>
     */
    cambiarCantidad(listaId: number, producto: ProductoEstado, delta: number): void {
        const nuevaCantidad = (producto.cantidad || 1) + delta;
        if (nuevaCantidad < 1) return;

        this.listaService
            .cambiarCantidadProducto(listaId, producto.id, nuevaCantidad)
            .subscribe({
                next: () => this.cargarListas(),
                error: () => {
                    this.errorStr = 'No se pudo actualizar la cantidad.';
                    this.cdr.detectChanges();
                }
            });
    }

    /**
     * Cambia cantidad de producto propio
     */
    cambiarCantidadPropio(producto: ProductoPropio, delta: number): void {
        const nuevaCantidad = (producto.cantidad || 1) + delta;
        if (nuevaCantidad < 1) return;

        this.productoService.actualizarProductoPropio(producto.id, {
            nombre: producto.nombre,
            precioObjetivo: producto.precioObjetivo,
            notas: producto.notas,
            listaId: producto.listaId,
            supermercado: producto.supermercado,
            cantidad: nuevaCantidad
        }).subscribe({
            next: () => this.cargarListas(),
            error: () => {
                this.errorStr = 'No se pudo actualizar la cantidad.';
                this.cdr.detectChanges();
            }
        });
    }

    /**
     * Crea un producto propio y lo añade a la lista
     * Servicio devuelve: Observable<ProductoPropio>
     */
    crearYAgregarProductoPropio(lista: ListaDetalle): void {
        if (!this.nuevoProducto.nombre.trim()) return;

        const usuarioId = this.authService.getId();
        if (!usuarioId) return;

        this.guardando = true;

        this.productoService.crearProductoPropio(
            usuarioId,
            this.nuevoProducto.nombre.trim(),
            this.nuevoProducto.precioObjetivo,
            this.nuevoProducto.notas || undefined,
            lista.codLista,
            this.nuevoProducto.supermercado || undefined
        ).subscribe({
            next: (creado) => {
                this.guardando = false;
                this.productosPropios.push(creado);
                this.mostrarFormNuevo = false;
                this.resetFormNuevo();
                this.panelPropioAbiertoEnLista = null;
                this.cargarListas();
                this.cdr.detectChanges();
            },
            error: () => {
                this.guardando = false;
                this.errorStr = 'No se pudo crear el producto propio.';
                this.cdr.detectChanges();
            }
        });
    }

    /**
     * Resetea formulario de producto nuevo
     */
    resetFormNuevo(): void {
        this.nuevoProducto = {
            nombre: '',
            precioObjetivo: undefined,
            notas: '',
            supermercado: ''
        };
    }

    // ===================== PRODUCTOS OFICIALES =====================

    togglePanelProducto(codLista: number): void {
        if (this.panelOficialAbiertoEnLista === codLista) {
            this.panelOficialAbiertoEnLista = null;
            this.busquedaProducto = '';
            this.resultadosBusqueda = [];
        } else {
            this.panelOficialAbiertoEnLista = codLista;
            this.panelPropioAbiertoEnLista = null;
            this.busquedaProducto = '';
            this.resultadosBusqueda = [];
        }
    }

    /**
     * Búsqueda con debounce
     * Servicio devuelve: Observable<Producto[]>
     */
    onBusquedaProducto(): void {
        clearTimeout(this.searchTimer);

        const query = this.busquedaProducto.trim();

        if (query.length < 2) {
            this.resultadosBusqueda = [];
            this.buscando = false;
            return;
        }

        this.buscando = true;
        this.cdr.detectChanges();

        this.searchTimer = setTimeout(() => {
            this.productoService.buscarProductos(query).subscribe({
                next: (data) => {
                    this.resultadosBusqueda = data || [];
                    this.buscando = false;
                    this.cdr.detectChanges();
                },
                error: () => {
                    this.buscando = false;
                    this.cdr.detectChanges();
                }
            });
        }, 350);
    }

    /**
     * Añade producto oficial a lista
     */
    agregarProductoOficialALista(lista: ListaDetalle, producto: Producto): void {
        const currentIds = lista.productos.map(p => p.id);

        if (currentIds.includes(producto.id)) return;

        const newIds = [...currentIds, producto.id];

        const usuariosIds = lista.usuariosCompartida
            ? lista.usuariosCompartida.map(u => u.id)
            : [];

        this.listaService.actualizarLista(lista.codLista, {
            productosEnLista: newIds,
            usuariosCompartida: usuariosIds
        }).subscribe({
            next: () => {
                this.panelOficialAbiertoEnLista = null;
                this.busquedaProducto = '';
                this.resultadosBusqueda = [];
                this.cargarListas();
            },
            error: () => {
                this.errorStr = 'No se pudo añadir el producto a la lista.';
                this.cdr.detectChanges();
            }
        });
    }

    // ===================== ACCIONES LISTA =====================

    /**
     * Devuelve integrantes de la lista
     */
    obtenerIntegrantes(lista: ListaDetalle): IntegranteLista[] {
        const integrantes: IntegranteLista[] = [];

        integrantes.push({
            id: lista.usuarioDuenoId,
            nick: lista.nombreDuenoNick,
            esDueno: true
        });

        if (lista.usuariosCompartida) {
            lista.usuariosCompartida.forEach(u => {
                integrantes.push({
                    id: u.id,
                    nick: u.nick,
                    esDueno: false
                });
            });
        }

        return integrantes;
    }

    /**
     * Cambia estado comprado (optimista)
     */
    cambiarEstadoComprado(listaId: number, producto: ProductoEstado): void {
        const nuevoEstado = !producto.comprado;

        // UI inmediata
        producto.comprado = nuevoEstado;
        this.cdr.detectChanges();

        this.listaService
            .cambiarEstadoComprado(listaId, producto.id, nuevoEstado)
            .subscribe({
                next: () => { },
                error: () => {
                    // revertir
                    producto.comprado = !nuevoEstado;
                    this.cdr.detectChanges();
                }
            });
    }

    /**
     * Elimina lista
     */
    eliminarLista(listaId: number): void {
        this.listaService.eliminarLista(listaId).subscribe({
            next: () => {
                this.listas = this.listas.filter(l => l.codLista !== listaId);
                this.cdr.detectChanges();
            },
            error: (err) => console.error('Error al eliminar lista', err)
        });
    }

    /**
     * Modifica nombre lista
     */
    onModificarNombre(lista: ListaDetalle): void {
        const nuevoNombre = this.inputNuevoNombre.trim();
        if (!nuevoNombre) return;

        this.listaService
            .cambiarNombreLista(lista.codLista, nuevoNombre)
            .subscribe({
                next: () => {
                    lista.nombre = nuevoNombre;
                    this.mostrarFeedback('Nombre actualizado.', 'success');
                    this.cdr.detectChanges();
                },
                error: () => this.mostrarFeedback('Error al cambiar nombre.', 'danger')
            });
    }

    /**
     * Publica lista
     */
    onPublicar(listaId: number): void {
        this.listaService.publicarLista(listaId).subscribe({
            next: () => {
                const lista = this.listas.find(l => l.codLista === listaId);
                if (lista) lista.publicada = true;
                this.cdr.detectChanges();
            },
            error: (err) => console.error('Error al publicar lista', err)
        });
    }

    // ===================== UI version 2 =====================

    mostrarFeedback(msj: string, tipo: 'success' | 'danger' = 'success'): void {
        this.feedbackMsg = msj;
        this.feedbackTipo = tipo;
        this.cdr.detectChanges();
    }

    togglePanelCrear(): void {
        this.panelCrearAbierto = !this.panelCrearAbierto;

        if (this.panelCrearAbierto) {
            this.panelUnirseAbierto = false;
            this.inputNombreLista = '';
        }
    }

    togglePanelUnirse(): void {
        this.panelUnirseAbierto = !this.panelUnirseAbierto;

        if (this.panelUnirseAbierto) {
            this.panelCrearAbierto = false;
            this.inputCodigoUnirse = '';
        }
    }

    // ===================== CREAR / UNIRSE =====================

    /**
     * Unirse a lista por código
     */
    onAnadirLista(): void {
        const codigo = this.inputCodigoUnirse.trim().toUpperCase();

        if (codigo.length !== 6) {
            this.mostrarFeedback('El código debe tener 6 caracteres.', 'danger');
            return;
        }

        this.procesandoAccion = true;

        this.listaService.unirseALista(codigo).subscribe({
            next: () => {
                this.mostrarFeedback('¡Te has unido a la lista con éxito!', 'success');
                this.panelUnirseAbierto = false;
                this.inputCodigoUnirse = '';
                this.cargarListas();

                setTimeout(() => {
                    this.procesandoAccion = false;
                });
            },
            error: (err) => {
                const msg =
                    typeof err.error === 'string'
                        ? err.error
                        : err.error?.message || 'No se pudo unir a la lista.';

                this.mostrarFeedback(msg, 'danger');
                this.procesandoAccion = false;
            }
        });
    }

    /**
     * Crear nueva lista
     */
    onCreateLista(): void {
        // Limpiamos input y evitamos espacios
        const nombre = this.inputNombreLista.trim() || undefined;
        // Activamos loading del botón
        this.procesandoAccion = true;
        this.listaService.crearLista(nombre)
            .pipe(
                // Se ejecuta SIEMPRE (éxito o error)
                // Aquí apagamos el loading
                finalize(() => {
                    this.procesandoAccion = false;
                })
            )
            .subscribe({
                next: () => {
                    this.mostrarFeedback('Lista creada correctamente.', 'success');
                    // Cerramos panel y limpiamos input
                    this.panelCrearAbierto = false;
                    this.inputNombreLista = '';
                    // Recargamos datos del servidor
                    this.cargarListas();
                },
                error: (err) => {
                    console.error('Error al crear lista', err);
                    this.mostrarFeedback(
                        'No se pudo crear la nueva lista.',
                        'danger'
                    );
                }
            });
    }

    /**
     * Calcula total de la lista
     */
    getListaTotal(lista: ListaDetalle): number {
        if (!lista) return 0;

        const totalOficiales = (lista.productos || [])
            .reduce((acc, p) => acc + (p.precio * (p.cantidad || 1)), 0);

        const totalPropios = (lista.productoPropios || [])
            .reduce((acc, p) => acc + ((p.precioObjetivo || 0) * (p.cantidad || 1)), 0);

        return totalOficiales + totalPropios;
    }
}