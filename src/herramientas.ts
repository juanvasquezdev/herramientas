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
 * tiene ruta propia y aparece en la página de inicio.
 */

export type Categoria = 'Negocio' | 'Deporte' | 'Contenido' | 'Experimentos'

export interface Herramienta {
  /** Lo que va en la dirección: /cotizador */
  ruta: string
  nombre: string
  /** Una frase: qué problema resuelve y para quién. */
  resumen: string
  categoria: Categoria
  Icono: LucideIcon
  /** Las que muestran tablas o gráficos anchos usan la página de 1080px en vez de la de 880px. */
  ancha?: boolean
  /**
   * Se carga con lazy() para que el código de cada herramienta baje solo cuando alguien
   * la abre. Así la página de inicio no carga, por ejemplo, el análisis de video.
   */
  Pantalla: LazyExoticComponent<ComponentType>
}

export const herramientas: Herramienta[] = [
  {
    ruta: 'cotizador',
    nombre: 'Cotizador',
    resumen:
      'Arma una cotización con ítems e impuesto y expórtala en PDF. Recuerda tus datos y lleva el consecutivo.',
    categoria: 'Negocio',
    Icono: ReceiptText,
    Pantalla: lazy(() => import('../apps/cotizador/Cotizador')),
  },
  {
    ruta: 'propuesta',
    nombre: 'Propuesta de servicios',
    resumen:
      'Deja por escrito el alcance, los entregables y la forma de pago de un trabajo, lista para firmar en PDF.',
    categoria: 'Negocio',
    Icono: FileSignature,
    Pantalla: lazy(() => import('../apps/propuesta/Propuesta')),
  },
  {
    ruta: 'rentabilidad',
    nombre: 'Precio y rentabilidad',
    resumen:
      'Calcula a cómo vender para cubrir costos y ganar el margen que quieres, o cuánto te deja el precio que ya tienes.',
    categoria: 'Negocio',
    Icono: Calculator,
    Pantalla: lazy(() => import('../apps/rentabilidad/Rentabilidad')),
  },
  {
    ruta: 'marcas',
    nombre: 'Registro de marcas',
    resumen:
      'Lleva las marcas de un atleta por prueba, mira la progresión en una gráfica y saca el informe en PDF.',
    categoria: 'Deporte',
    Icono: Trophy,
    Pantalla: lazy(() => import('../apps/marcas/Marcas')),
  },
  {
    ruta: 'cargas',
    nombre: 'Planificador de cargas',
    resumen:
      'Planea el entrenamiento de fuerza semana a semana y compara el volumen de cada una con la anterior.',
    categoria: 'Deporte',
    Icono: Dumbbell,
    ancha: true,
    Pantalla: lazy(() => import('../apps/cargas/Cargas')),
  },
  {
    ruta: 'biomecanica',
    nombre: 'Análisis de salto en video',
    resumen:
      'Sube el video de un salto y mide ángulos y tiempo de contacto cuadro por cuadro. El video no sale de tu equipo.',
    categoria: 'Deporte',
    Icono: Activity,
    ancha: true,
    Pantalla: lazy(() => import('../apps/biomecanica/Biomecanica')),
  },
  {
    ruta: 'contenido',
    nombre: 'Calendario de contenido',
    resumen:
      'Organiza las publicaciones del mes por red y por tema, y descubre cuáles te dan mejor resultado.',
    categoria: 'Contenido',
    Icono: CalendarDays,
    ancha: true,
    Pantalla: lazy(() => import('../apps/contenido/Contenido')),
  },
  {
    ruta: 'gestos',
    nombre: 'Control por gestos',
    resumen:
      'Maneja un reproductor, unas diapositivas o una pizarra con la mano frente a la cámara, sin tocar el teclado.',
    categoria: 'Experimentos',
    Icono: Hand,
    ancha: true,
    Pantalla: lazy(() => import('../apps/gestos/Gestos')),
  },
]

/** El orden en que se muestran los grupos en la página de inicio. */
export const ordenCategorias: Categoria[] = ['Negocio', 'Deporte', 'Contenido', 'Experimentos']
