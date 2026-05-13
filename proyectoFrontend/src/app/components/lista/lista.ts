import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ListaService } from '../../services/lista';
import { ProductoService } from '../../services/producto';
import { AuthService } from '../../services/auth';
import { ListaDetalle, IntegranteLista, ProductoEstado } from '../../models/lista';
import { ProductoPropio, Producto } from '../../models/producto';
import { finalize } from 'rxjs';
import { Router, RouterLink } from '@angular/router';
import { MensajeService } from '../../services/mensaje';

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

    // Variables de estado general y listas
    listas: ListaDetalle[] = [];
    cargando = true;
    errorStr = '';
    filtroListas: 'todas' | 'mias' | 'compartidas' = 'todas';

    // Variables de productos propios
    productosPropios: ProductoPropio[] = [];
    panelPropioAbiertoEnLista: number | null = null;
    mostrarFormNuevo = false;
    nuevoProducto = {
        nombre: '',
        precioObjetivo: undefined as number | undefined,
        notas: '',
        supermercado: ''
    };
    guardando = false;
    editandoProductoId: number | null = null;

    // Variables de productos oficiales
    panelOficialAbiertoEnLista: number | null = null;
    busquedaProducto = '';
    resultadosBusqueda: Producto[] = [];
    buscando = false;

    // Variables de UI y estado
    feedbackMsg = '';
    feedbackTipo: 'success' | 'danger' = 'success';
    private feedbackTimer: any = null;

    panelCrearAbierto = false;
    panelUnirseAbierto = false;
    inputNombreLista = '';
    inputCodigoUnirse = '';
    procesandoAccion = false;
    searchTimer: number | undefined;

    confirmandoModificarNombreListaId: number | null = null;
    inputNuevoNombre = '';
    confirmandoBorradoListaId: number | null = null;

    currentUserId: number | null = null;
    supermercadosOficiales: string[] = [];

    constructor(
        private listaService: ListaService,
        private productoService: ProductoService,
        private authService: AuthService,
        private mensajeService: MensajeService,
        private cdr: ChangeDetectorRef,
        private router: Router
    ) { }

    verCatalogop() {
        this.router.navigate(['/productos']);
    }

    // ==========================================
    // CICLO DE VIDA E INICIALIZACIÓN
    // ==========================================

    ngOnInit(): void {
        this.currentUserId = this.authService.getId();
        this.cargarListas();
        this.cargarProductosPropios();
        this.opcionesSuperMercadosOficiales();
    }

    cargarListas(silencioso = false): void {
        if (!silencioso) this.cargando = true;

        this.listaService.obtenerMisListas().subscribe({
            next: (data) => {
                let listasSucias = data || [];

                // Ordenamos aquí una sola vez al cargar: completadas al fondo
                this.listas = listasSucias.sort((a, b) => {
                    const aComp = this.estaListaCompletada(a) ? 1 : 0;
                    const bComp = this.estaListaCompletada(b) ? 1 : 0;
                    return aComp - bComp;
                });

                if (!silencioso) {
                    setTimeout(() => {
                        this.cargando = false;
                        this.cdr.detectChanges();
                    }, 500);
                } else {
                    this.cdr.detectChanges();
                }
            },
            error: () => {
                this.errorStr = 'No se pudieron cargar tus listas.';
                this.cargando = false;
                this.cdr.detectChanges();
            }
        });
    }

    cargarProductosPropios(): void {
        const usuarioId = this.authService.getId();
        if (!usuarioId) return;

        this.productoService
            .listarProductosPropiosDeUsuario(usuarioId)
            .subscribe({
                next: (data) => {
                    this.productosPropios = data || [];
                    this.productosPropios.sort((a, b) => (a.precioObjetivo || 0) - (b.precioObjetivo || 0));
                    this.cdr.detectChanges();
                },
                error: () => {
                    this.productosPropios = [];
                }
            });
    }

    opcionesSuperMercadosOficiales() {
        this.productoService.listarSupermercados().subscribe({
            next: (data) => {
                this.supermercadosOficiales = data;
                this.cdr.detectChanges();
            },
            error: (err) => console.error('Error al cargar productos', err)
        });
    }

    // ==========================================
    // GETTERS Y MÉTODOS DE UTILIDAD
    // ==========================================

    get listasFiltradas(): ListaDetalle[] {
        let filtradas = [...this.listas];

        if (this.filtroListas === 'mias') {
            filtradas = filtradas.filter(l => l.usuarioDuenoId === this.currentUserId);
        } else if (this.filtroListas === 'compartidas') {
            filtradas = filtradas.filter(l => l.usuarioDuenoId !== this.currentUserId);
        }

        return filtradas;
    }

    get listasOrdenadas(): ListaDetalle[] {
        return this.listasFiltradas;
    }

    get listasPares(): ListaDetalle[] {
        return this.listasOrdenadas.filter((_, i) => i % 2 === 0);
    }

    get listasImpares(): ListaDetalle[] {
        return this.listasOrdenadas.filter((_, i) => i % 2 !== 0);
    }

    getListaTotal(lista: ListaDetalle): number {
        return this.sumarPrecios(lista, false);
    }

    getListaPendienteTotal(lista: ListaDetalle): number {
        return this.sumarPrecios(lista, true);
    }

    private sumarPrecios(lista: ListaDetalle, soloPendientes: boolean): number {
        if (!lista) return 0;

        const suma = (items: any[], isPropio: boolean) => (items || [])
            .filter(i => !soloPendientes || !i.comprado)
            .reduce((acc, i) => acc + ((isPropio ? i.precioObjetivo : i.precio) * (i.cantidad || 1)), 0);

        return suma(lista.productos, false) + suma(lista.productoPropios, true);
    }

    estaListaCompletada(lista: ListaDetalle): boolean {
        const totalItems = lista.productos.length + (lista.productoPropios ? lista.productoPropios.length : 0);
        if (totalItems === 0) return false;

        const todosOficialesComprados = lista.productos.every(p => p.comprado);
        const todosPropiosComprados = (lista.productoPropios || []).every(pp => pp.comprado);

        return todosOficialesComprados && todosPropiosComprados;
    }

    puedePubilcar(lista: ListaDetalle): boolean {
        const tienePropios = lista.productoPropios && lista.productoPropios.length > 0;
        return !tienePropios && !lista.publicada;
    }

    getSupermarketIcon(item: any): { type: 'img' | 'icon', value: string } {
        if (!item) return { type: 'icon', value: 'bi-house-door' };

        let s = "";
        if (typeof item === 'string') {
            s = item;
        } else {
            s = item.supermercado || "";
            if (!s && item.nombre) {
                const nombreLower = item.nombre.toLowerCase();
                if (nombreLower.includes('mercadona')) s = 'Mercadona';
                else if (nombreLower.includes('carrefour')) s = 'Carrefour';
                else if (nombreLower.includes('lidl')) s = 'Lidl';
                else if (nombreLower.includes('dia')) s = 'Dia';
            }
        }

        if (!s) return { type: 'icon', value: 'bi-house-door' };

        const superLower = s.trim().toLowerCase();

        if (superLower.includes('mercadona')) return { type: 'img', value: '/images/Mercadona.png' };
        if (superLower.includes('carrefour')) return { type: 'img', value: '/images/Carrefour.svg' };
        if (superLower.includes('lidl')) return { type: 'img', value: '/images/Lidl.png' };
        if (superLower.includes('dia')) return { type: 'img', value: '/images/Dia.png' };

        return { type: 'icon', value: 'bi-house-door' };
    }

    esDuenioProducto(pp: any): boolean {
        return this.currentUserId !== null && Number(this.currentUserId) === Number(pp.usuarioId);
    }



    obtenerIntegrantes(lista: ListaDetalle): IntegranteLista[] {
        const integrantes: IntegranteLista[] = [];
        integrantes.push({
            id: lista.usuarioDuenoId,
            nick: lista.nombreDuenoNick,
            esDueno: true,
            imagenUrl: lista.imagenDuenoUrl
        });

        if (lista.usuariosCompartida) {
            lista.usuariosCompartida.forEach(u => {
                integrantes.push({
                    id: u.id,
                    nick: u.nick,
                    esDueno: false,
                    imagenUrl: u.imagenUrl
                });
            });
        }
        return integrantes;
    }

    mostrarFeedback(msj: string, tipo: 'success' | 'danger' = 'success'): void {
        this.feedbackMsg = msj;
        this.feedbackTipo = tipo;
        this.cdr.detectChanges();
    }

    // ==========================================
    // GESTIÓN DE LISTAS
    // ==========================================

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

    onCreateLista(): void {
        const nombre = this.inputNombreLista.trim() || undefined;
        this.procesandoAccion = true;
        this.listaService.crearLista(nombre)
            .pipe(
                finalize(() => {
                    this.procesandoAccion = false;
                })
            )
            .subscribe({
                next: () => {
                    this.mostrarFeedback('Lista creada correctamente.', 'success');
                    this.panelCrearAbierto = false;
                    this.inputNombreLista = '';
                    this.cargarListas();
                },
                error: (err) => {
                    console.error('Error al crear lista', err);
                    this.mostrarFeedback('No se pudo crear la nueva lista.', 'danger');
                }
            });
    }

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
                const msg = typeof err.error === 'string' ? err.error : err.error?.message || 'No se pudo unir a la lista.';
                this.mostrarFeedback(msg, 'danger');
                this.procesandoAccion = false;
            }
        });
    }

    prepararModificarNombre(lista: ListaDetalle): void {
        this.confirmandoModificarNombreListaId = lista.codLista;
        this.inputNuevoNombre = lista.nombre || '';
    }

    cancelarModificarNombre(): void {
        this.confirmandoModificarNombreListaId = null;
        this.inputNuevoNombre = '';
    }

    onModificarNombre(lista: ListaDetalle): void {
        const nuevoNombre = this.inputNuevoNombre.trim();
        if (!nuevoNombre) return;

        this.listaService.cambiarNombreLista(lista.codLista, nuevoNombre).subscribe({
            next: () => {
                lista.nombre = nuevoNombre;
                this.mostrarFeedback('Nombre actualizado.', 'success');
                this.cdr.detectChanges();
            },
            error: () => this.mostrarFeedback('Error al cambiar nombre.', 'danger')
        });
    }

    prepararBorradoLista(listaId: number): void {
        this.confirmandoBorradoListaId = listaId;
    }

    cancelarBorradoLista(): void {
        this.confirmandoBorradoListaId = null;
    }

    eliminarLista(listaId: number): void {
        this.mensajeService.confirmar(
            '¿Estás seguro de que quieres eliminar esta lista por completo? Esta acción no se puede deshacer.',
            () => {
                this.listaService.eliminarLista(listaId).subscribe({
                    next: () => {
                        this.listas = this.listas.filter(l => l.codLista !== listaId);
                        this.confirmandoBorradoListaId = null;
                        this.mensajeService.mostrarSuccess('Lista eliminada correctamente.');
                        this.cdr.detectChanges();
                    },
                    error: (err) => {
                        console.error('Error al eliminar lista', err);
                        this.mensajeService.mostrarError('No se pudo eliminar la lista.');
                    }
                });
            }
        );
    }

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

    onDespublicar(listaId: number): void {
        this.listaService.eliminarDeListasPublicas(listaId).subscribe({
            next: () => {
                const lista = this.listas.find(l => l.codLista === listaId);
                if (lista) lista.publicada = false;
                this.cdr.detectChanges();
            },
            error: (err) => console.error('Error al despublicar lista', err)
        });
    }

    // ==========================================
    // GESTIÓN DE PRODUCTOS OFICIALES
    // ==========================================

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
                    this.resultadosBusqueda.sort((a, b) => (a.precio || 0) - (b.precio || 0));
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

    agregarProductoOficialALista(lista: ListaDetalle, producto: Producto): void {
        const currentIds = lista.productos.map(p => p.id);
        if (currentIds.includes(producto.id)) return;

        const newIds = [...currentIds, producto.id];
        const usuariosIds = lista.usuariosCompartida ? lista.usuariosCompartida.map(u => u.id) : [];

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

    cambiarEstadoComprado(listaId: number, producto: ProductoEstado): void {
        producto.comprado = !producto.comprado;
        this.cdr.detectChanges();

        this.listaService.cambiarEstadoComprado(listaId, producto.id, producto.comprado)
            .subscribe({ next: () => this.cargarListas(true) });
    }

    cambiarCantidad(listaId: number, producto: ProductoEstado, delta: number): void {
        const nueva = (producto.cantidad || 1) + delta;
        if (nueva < 1) return;

        producto.cantidad = nueva;
        this.cdr.detectChanges();

        this.listaService.cambiarCantidadProducto(listaId, producto.id, nueva)
            .subscribe({ next: () => this.cargarListas(true) });
    }

    eliminarProducto(lista: ListaDetalle, producto: ProductoEstado, event: MouseEvent): void {
        event.stopPropagation();

        this.mensajeService.confirmar(`¿Quitar "${producto.nombre}" de la lista?`, () => {
            const newIds = lista.productos.filter(p => p.id !== producto.id).map(p => p.id);
            const usuariosIds = lista.usuariosCompartida ? lista.usuariosCompartida.map(u => u.id) : [];

            this.listaService.actualizarLista(lista.codLista, {
                productosEnLista: newIds,
                usuariosCompartida: usuariosIds
            }).subscribe({
                next: () => {
                    this.mensajeService.mostrarSuccess('Producto quitado de la lista.');
                    this.cargarListas(true);
                },
                error: () => {
                    this.mensajeService.mostrarError('Error al quitar el producto.');
                    this.cdr.detectChanges();
                }
            });
        });
    }

    // ==========================================
    // GESTIÓN DE PRODUCTOS PROPIOS
    // ==========================================

    togglePanelProductoPropio(codLista: number): void {
        if (this.panelPropioAbiertoEnLista === codLista) {
            this.panelPropioAbiertoEnLista = null;
            this.mostrarFormNuevo = false;
            this.editandoProductoId = null;
        } else {
            this.panelPropioAbiertoEnLista = codLista;
            this.panelOficialAbiertoEnLista = null;
            this.mostrarFormNuevo = false;
            this.editandoProductoId = null;
            this.resetFormNuevo();
        }
    }

    crearYAgregarProductoPropio(lista: ListaDetalle): void {
        if (!this.nuevoProducto.nombre.trim()) return;

        const usuarioId = this.authService.getId();
        if (!usuarioId) return;

        this.guardando = true;

        if (this.editandoProductoId) {
            this.productoService.actualizarProductoPropio(this.editandoProductoId, {
                nombre: this.nuevoProducto.nombre.trim(),
                precioObjetivo: this.nuevoProducto.precioObjetivo,
                notas: this.nuevoProducto.notas || undefined,
                listaId: lista.codLista,
                supermercado: this.nuevoProducto.supermercado || undefined,
                cantidad: 1
            }).subscribe({
                next: () => {
                    this.guardando = false;
                    this.mostrarFormNuevo = false;
                    this.editandoProductoId = null;
                    this.resetFormNuevo();
                    this.panelPropioAbiertoEnLista = null;
                    this.cargarListas();
                    this.cargarProductosPropios();
                    this.cdr.detectChanges();
                },
                error: () => {
                    this.guardando = false;
                    this.errorStr = 'No se pudo actualizar el producto.';
                    this.cdr.detectChanges();
                }
            });
        } else {
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
    }

    editarProductoPropio(codLista: number, producto: ProductoPropio): void {
        this.panelPropioAbiertoEnLista = codLista;
        this.mostrarFormNuevo = true;
        this.editandoProductoId = producto.id;
        this.nuevoProducto = {
            nombre: producto.nombre,
            precioObjetivo: producto.precioObjetivo,
            notas: producto.notas || '',
            supermercado: producto.supermercado || ''
        };
        this.cdr.detectChanges();
    }

    resetFormNuevo(): void {
        this.nuevoProducto = {
            nombre: '',
            precioObjetivo: undefined,
            notas: '',
            supermercado: ''
        };
    }

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

    cambiarEstadoCompradoPropio(listaId: number, producto: ProductoPropio): void {
        producto.comprado = !producto.comprado;
        this.cdr.detectChanges();

        this.productoService.actualizarProductoPropio(producto.id, { ...producto, listaId, comprado: producto.comprado })
            .subscribe({ next: () => this.cargarListas(true) });
    }

    cambiarCantidadPropio(producto: ProductoPropio, delta: number): void {
        const nueva = (producto.cantidad || 1) + delta;
        if (nueva < 1) return;

        producto.cantidad = nueva;
        this.cdr.detectChanges();

        this.productoService.actualizarProductoPropio(producto.id, { ...producto, cantidad: nueva })
            .subscribe({ next: () => this.cargarListas(true) });
    }

    onCambiarSupermercadoPropio(listaId: number, pp: ProductoPropio, event: Event): void {
        const select = event.target as HTMLSelectElement;
        this.cambiarSupermercadoPropio(listaId, pp, select.value);
    }

    cambiarSupermercadoPropio(listaId: number, pp: ProductoPropio, nuevoSup: string): void {
        if (nuevoSup === pp.supermercado) return;

        this.productoService.actualizarProductoPropio(pp.id, {
            ...pp,
            supermercado: nuevoSup || undefined,
            listaId: listaId
        }).subscribe({
            next: () => {
                pp.supermercado = nuevoSup;
                this.mostrarFeedback('Supermercado actualizado.', 'success');
                this.cdr.detectChanges();
            },
            error: () => {
                this.mostrarFeedback('No se pudo actualizar el supermercado.', 'danger');
            }
        });
    }

    quitarDeListaPropio(producto: ProductoPropio, event: MouseEvent): void {
        event.stopPropagation();

        this.mensajeService.confirmar(`¿Quitar "${producto.nombre}" de la lista?`, () => {
            this.productoService.actualizarProductoPropio(producto.id, {
                nombre: producto.nombre,
                precioObjetivo: producto.precioObjetivo,
                notas: producto.notas,
                listaId: null,
                supermercado: producto.supermercado,
                cantidad: producto.cantidad
            }).subscribe({
                next: () => {
                    this.mensajeService.mostrarSuccess('Producto quitado de la lista.');
                    this.cargarListas(true);
                },
                error: () => {
                    this.mensajeService.mostrarError('No se pudo quitar el producto.');
                    this.cdr.detectChanges();
                }
            });
        });
    }

    eliminarProductoPropio(productoId: number, event: MouseEvent): void {
        event.stopPropagation();

        this.mensajeService.confirmar('¿Borrar este producto de tu inventario para siempre?', () => {
            this.productoService.eliminarProductoPropio(productoId).subscribe({
                next: () => {
                    this.mensajeService.mostrarSuccess('Producto eliminado permanentemente.');
                    this.cargarProductosPropios();
                    this.cargarListas(true);
                },
                error: () => {
                    this.mensajeService.mostrarError('Error al eliminar el producto.');
                    this.cdr.detectChanges();
                }
            });
        });
    }
}