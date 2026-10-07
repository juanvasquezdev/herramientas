import { lazy, type ComponentType, type LazyExoticComponent } from 'react'

/**
 * El registro de herramientas del sitio.
 *
 * Para publicar una nueva: se crea su carpeta en apps/ y se agrega aquí. Con eso ya
 * tiene ruta propia y aparece en la página de inicio.
 */

export type Categoria = 'Negocio' | 'Deporte' | 'Contenido' | 'Demo'

export interface Herramienta {
  /** Lo que va en la dirección: /cotizador */
  ruta: string
  nombre: string
  /** Una frase: qué problema resuelve y para quién. */
  resumen: string
  categoria: Categoria
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
      'Arma una cotización con ítems e impuesto y expórtala en PDF. Recuerda los datos de tu empresa y lleva el consecutivo.',
    categoria: 'Negocio',
    Pantalla: lazy(() => import('../apps/cotizador/Cotizador')),
  },
]

/** El orden en que se muestran los grupos en la página de inicio. */
export const ordenCategorias: Categoria[] = ['Negocio', 'Deporte', 'Contenido', 'Demo']
