import {
  Activity,
  Calculator,
  CalendarDays,
  Dumbbell,
  FileSignature,
  Hand,
  type LucideIcon,
  ReceiptText,
  Trophy,
} from 'lucide-react'
import { type ComponentType, type LazyExoticComponent, lazy } from 'react'

/**
 * El registro de herramientas del sitio.
 *
 * Para publicar una nueva: se crea su carpeta en apps/ y se agrega aquí. Con eso ya
 * tiene ruta propia, aparece en el inicio y en la barra para cambiar de herramienta.
 */

/** La categoría decide el color de la herramienta. Los colores están en shared/ui.css. */
export type Categoria = 'negocio' | 'deporte' | 'contenido' | 'experimentos'

export const NOMBRE_DE_CATEGORIA: Record<Categoria, string> = {
  negocio: 'Negocio',
  deporte: 'Deporte',
  contenido: 'Contenido',
  experimentos: 'Experimentos',
}

type Cargador = () => Promise<{ default: ComponentType }>

interface Ficha {
  /** Lo que va en la dirección: /cotizador */
  ruta: string
  nombre: string
  /** Una sola palabra, para la barra de abajo. */
  corto: string
  /** Una frase: qué problema resuelve y para quién. */
  resumen: string
  categoria: Categoria
  Icono: LucideIcon
  /** Las que muestran tablas o gráficos anchos usan la página de 1080px en vez de la de 880px. */
  ancha?: boolean
}

export interface Herramienta extends Ficha {
  /**
   * Se carga con lazy() para que el código de cada herramienta baje solo cuando alguien
   * la abre. Así el inicio no carga, por ejemplo, el análisis de video.
   */
  Pantalla: LazyExoticComponent<ComponentType>
  /**
   * Empieza a bajar el código antes de que la persona haga clic (al pasar el cursor o
   * llegar con el teclado), para que el cambio se sienta inmediato.
   */
  precargar: () => void
}

function registrar(ficha: Ficha, cargar: Cargador): Herramienta {
  return {
    ...ficha,
    Pantalla: lazy(cargar),
    // Si la precarga falla (sin conexión, por ejemplo) no pasa nada: se reintenta al abrirla.
    precargar: () => void cargar().catch(() => undefined),
  }
}

export const herramientas: Herramienta[] = [
  registrar(
    {
      ruta: 'cotizador',
      nombre: 'Cotizador',
      corto: 'Cotizador',
      resumen:
        'Arma una cotización con ítems e impuesto y expórtala en PDF. Recuerda tus datos y lleva el consecutivo.',
      categoria: 'negocio',
      Icono: ReceiptText,
    },
    () => import('../apps/cotizador/Cotizador'),
  ),
  registrar(
    {
      ruta: 'propuesta',
      nombre: 'Propuesta de servicios',
      corto: 'Propuesta',
      resumen:
        'Deja por escrito el alcance, los entregables y la forma de pago de un trabajo, lista para firmar en PDF.',
      categoria: 'negocio',
      Icono: FileSignature,
    },
    () => import('../apps/propuesta/Propuesta'),
  ),
  registrar(
    {
      ruta: 'rentabilidad',
      nombre: 'Precio y rentabilidad',
      corto: 'Precio',
      resumen:
        'Calcula a cómo vender para cubrir costos y ganar el margen que quieres, o cuánto te deja el precio que ya tienes.',
      categoria: 'negocio',
      Icono: Calculator,
    },
    () => import('../apps/rentabilidad/Rentabilidad'),
  ),
  registrar(
    {
      ruta: 'marcas',
      nombre: 'Registro de marcas',
      corto: 'Marcas',
      resumen:
        'Lleva las marcas de un atleta por prueba, mira la progresión en una gráfica y saca el informe en PDF.',
      categoria: 'deporte',
      Icono: Trophy,
    },
    () => import('../apps/marcas/Marcas'),
  ),
  registrar(
    {
      ruta: 'cargas',
      nombre: 'Planificador de cargas',
      corto: 'Cargas',
      resumen:
        'Planea el entrenamiento de fuerza semana a semana y compara el volumen de cada una con la anterior.',
      categoria: 'deporte',
      Icono: Dumbbell,
      ancha: true,
    },
    () => import('../apps/cargas/Cargas'),
  ),
  registrar(
    {
      ruta: 'biomecanica',
      nombre: 'Análisis de salto en video',
      corto: 'Salto',
      resumen:
        'Sube el video de un salto y mide ángulos y tiempo de contacto cuadro por cuadro. El video no sale de tu equipo.',
      categoria: 'deporte',
      Icono: Activity,
      ancha: true,
    },
    () => import('../apps/biomecanica/Biomecanica'),
  ),
  registrar(
    {
      ruta: 'contenido',
      nombre: 'Calendario de contenido',
      corto: 'Contenido',
      resumen:
        'Organiza las publicaciones del mes por red y por tema, y descubre cuáles te dan mejor resultado.',
      categoria: 'contenido',
      Icono: CalendarDays,
      ancha: true,
    },
    () => import('../apps/contenido/Contenido'),
  ),
  registrar(
    {
      ruta: 'gestos',
      nombre: 'Control por gestos',
      corto: 'Gestos',
      resumen:
        'Maneja un reproductor, unas diapositivas o una pizarra con la mano frente a la cámara, sin tocar el teclado.',
      categoria: 'experimentos',
      Icono: Hand,
      ancha: true,
    },
    () => import('../apps/gestos/Gestos'),
  ),
]
