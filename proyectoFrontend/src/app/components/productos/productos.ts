import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { Producto } from '../../models/producto';
import { ProductoService } from '../../services/producto';
import { AuthService } from '../../services/auth';
import { MensajeService } from '../../services/mensaje';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './productos.html',
  styleUrls: ['./productos.css'],
})
export class ProductosComponent implements OnInit {

  // ==========================================
  // VARIABLES DE ESTADO Y DATOS
  // ==========================================
  productos: Producto[] = [];
  supermercadosOficiales: string[] = [];
  categoriasGenericas: string[] = [];

  // ==========================================
  // VARIABLES DE FILTROS
  // ==========================================
  searchQuery = '';
  minPrice: number | null = null;
  maxPrice: number | null = null;
  selectedSupermarket: string = '';
  selectedCategory: string = '';
  showOnlyMine: boolean = false;

  // ==========================================
  // VARIABLES DEL FORMULARIO DE CREACIÓN
  // ==========================================
  mostrarFormulario = false;
  mensajeExito = '';
  nuevoNombre = '';
  nuevaDescripcion = '';
  nuevoPrecio: number | null = null;
  nuevoSupermercado = '';
  nuevaImagenUrl = '';
  nuevaCategoria = '';
  imagenSeleccionada: File | null = null;

  @ViewChild('fileInput') fileInput!: ElementRef;

  constructor(
    private productoService: ProductoService,
    public authService: AuthService,
    private mensajeService: MensajeService,
    private cd: ChangeDetectorRef,
    private route: ActivatedRoute
  ) { }

  // ==========================================
  // INICIALIZACIÓN
  // ==========================================

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const paramSupermercado = params['supermercado'];
      if (paramSupermercado) {
        this.selectedSupermarket = paramSupermercado;
      }
    });
    this.cargarProductos();
    this.cargarListasDinamicas();
  }

  cargarProductos(): void {
    this.productoService.listarProductos()
      .subscribe({
        next: (res) => {
          this.productos = res;
          this.cd.detectChanges();
        },
        error: (err) => console.error('Error cargando productos:', err)
      });
  }

  cargarListasDinamicas() {
    this.productoService.listarCategorias().subscribe(cats => {
      this.categoriasGenericas = cats;
      this.cd.detectChanges();
    });
    this.productoService.listarSupermercados().subscribe(sups => {
      this.supermercadosOficiales = sups;
      this.cd.detectChanges();
    });
  }

  // ==========================================
  // GETTERS DE ESTADO
  // ==========================================

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  // ==========================================
  // LÓGICA DE FILTRADO Y LISTAS
  // ==========================================

  get productosFiltrados(): Producto[] {
    const query = this.searchQuery ? this.searchQuery.trim().toLowerCase() : '';

    return this.productos.filter(p => {
      if (!p.confirmado) return false;

      const matchesSearch = !query || p.nombre.toLowerCase().includes(query);
      const matchesMinPrice = this.minPrice === null || p.precio >= this.minPrice;
      const matchesMaxPrice = this.maxPrice === null || p.precio <= this.maxPrice;
      let matchesSupermarket = true;
      if (this.selectedSupermarket === 'Mercado Libre') {
        const superNormalize = p.supermercado?.trim().toLowerCase() || '';
        const oficialesReales = this.supermercadosOficiales
          .filter(s => s !== 'Mercado Libre')
          .map(o => o.toLowerCase());
        const isOficial = oficialesReales.includes(superNormalize);
        matchesSupermarket = !isOficial && !!p.supermercado;
      } else if (this.selectedSupermarket !== '') {
        const superNormalize = p.supermercado?.trim().toLowerCase() || '';
        matchesSupermarket = superNormalize === this.selectedSupermarket.toLowerCase();
      }

      const matchesCategory = !this.selectedCategory ||
        (p.categoria && p.categoria.toLowerCase() === this.selectedCategory.toLowerCase());

      const matchesMine = !this.showOnlyMine || p.usuarioRegistradorId === this.authService.getId();

      return matchesSearch && matchesMinPrice && matchesMaxPrice && matchesSupermarket && matchesCategory && matchesMine;
    }).sort((a, b) => a.precio - b.precio);
  }

  getSupermercados(): string[] {
    const lista = [...this.supermercadosOficiales];
    if (!lista.includes('Mercado Libre')) {
      lista.push('Mercado Libre');
    }
    return lista;
  }

  // ==========================================
  // UTILIDADES DE PRESENTACIÓN (Iconos, Estrellas)
  // ==========================================

  getMediaPuntuacion(): number {
    const productosConPuntuacion = this.productos.filter(p => p.mediaPuntuacion !== undefined && p.mediaPuntuacion !== null);
    if (productosConPuntuacion.length === 0) return 0;

    const totalPuntuaciones = productosConPuntuacion.reduce((acc, p) => acc + p.mediaPuntuacion!, 0);
    return totalPuntuaciones / productosConPuntuacion.length;
  }

  getEstrellas(puntuacion?: number | null): string[] {
    const estrellas: string[] = [];
    if (puntuacion === undefined || puntuacion === null || puntuacion === 0) {
      return ['☆', '☆', '☆', '☆', '☆'];
    }

    const puntuacionNormalizada = Math.max(0, Math.min(5, puntuacion));
    const estrellasEnteras = Math.floor(puntuacionNormalizada);
    const tieneMediaEstrella = puntuacionNormalizada - estrellasEnteras >= 0.5;

    for (let i = 0; i < estrellasEnteras; i++) estrellas.push('★');
    if (tieneMediaEstrella) estrellas.push('½');

    const totalEstrellas = estrellasEnteras + (tieneMediaEstrella ? 1 : 0);
    for (let i = totalEstrellas; i < 5; i++) estrellas.push('☆');

    return estrellas;
  }

  getMediaEstrellas(): string {
    const media = this.getMediaPuntuacion();
    const estrellasEnteras = Math.floor(media);
    const tieneMediaEstrella = media - estrellasEnteras >= 0.5;
    let resultado = '';

    for (let i = 0; i < estrellasEnteras; i++) resultado += '★';
    if (tieneMediaEstrella) resultado += '½';

    const totalEstrellas = estrellasEnteras + (tieneMediaEstrella ? 1 : 0);
    for (let i = totalEstrellas; i < 5; i++) resultado += '☆';

    return resultado;
  }

  isOficial(nombre: string): boolean {
    if (!nombre) return false;
    const superNormalize = nombre.trim().toLowerCase();
    // Mercado Libre no tiene logo oficial PNG, así que lo tratamos como no oficial para que use el icono bi-house
    if (superNormalize === 'mercado libre') return false;
    return this.supermercadosOficiales.map(o => o.toLowerCase()).includes(superNormalize);
  }

  getLogoSupermercado(nombre: string): string {
    if (!nombre) return '';
    const superNormalize = nombre.trim().toLowerCase();
    if (superNormalize === 'carrefour') return '/images/Carrefour.svg';
    const oficial = this.supermercadosOficiales.find(o => o.toLowerCase() === superNormalize);
    return oficial ? `/images/${oficial}.png` : '';
  }

  getImagenProducto(nombre: string): string {
    if (!nombre) return 'https://picsum.photos/seed/default/400/300';
    return `https://picsum.photos/seed/${nombre}/400/300`;
  }

  // ==========================================
  // CREACIÓN DE PRODUCTOS Y FORMULARIO
  // ==========================================

  toggleFormulario(): void {
    this.mostrarFormulario = !this.mostrarFormulario;
  }

  crearProducto(): void {
    if (!this.nuevoNombre || !this.nuevaDescripcion || !this.nuevoPrecio) return;

    this.productoService.crearProducto({
      nombre: this.nuevoNombre,
      descripcion: this.nuevaDescripcion,
      precio: this.nuevoPrecio,
      supermercado: this.nuevoSupermercado || undefined,
      imagenUrl: this.nuevaImagenUrl || undefined,
      categoria: this.nuevaCategoria || undefined
    }).subscribe({
      next: (producto) => {
        this.productos.push(producto);
        this.nuevoNombre = '';
        this.nuevaDescripcion = '';
        this.nuevoPrecio = null;
        this.nuevoSupermercado = '';
        this.nuevaImagenUrl = '';
        this.nuevaCategoria = '';
        this.mostrarFormulario = false;

        this.mensajeService.mostrarSuccess('¡Producto creado! Pendiente de confirmación por el administrador.');
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('Error al crear producto:', err);
        this.mensajeService.mostrarError('Error al crear el producto.');
      }
    });
  }

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.imagenSeleccionada = file;
      this.mensajeService.mostrarInfo(`Imagen seleccionada: ${file.name}`);
    }
  }

  onImageError(event: any): void {
    event.target.src = 'https://static.vecteezy.com/system/resources/previews/024/392/058/non_2x/alert-mark-failed-to-load-something-went-wrong-tap-to-retry-concept-illustration-flat-design-eps10-simple-graphic-element-for-landing-page-empty-state-ui-infographic-icon-vector.jpg';
  }
}
