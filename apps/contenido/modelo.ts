import { hoyISO } from '../../shared/fecha'
import { nuevoId } from '../../shared/id'
import { esListaDe, esObjeto, esUnoDe, tieneTextos } from '../../shared/validar'

/** El calendario de contenido de una cuenta. */

export const ESTADOS = ['Idea', 'Grabado', 'Editado', 'Publicado'] as const
export type Estado = (typeof ESTADOS)[number]

/** De qué trata la publicación. Sirve para ver si la cuenta está balanceada. */
export const PILARES = [
  'Entrenamiento',
  'Competencia',
  'Detrás de cámaras',
  'Educativo',
  'Personal',
  'Promoción',
] as const
export type Pilar = (typeof PILARES)[number]

export const FORMATOS = ['Reel', 'Carrusel', 'Foto', 'Historia', 'Video largo'] as const
export type Formato = (typeof FORMATOS)[number]

export const PLATAFORMAS = ['Instagram', 'TikTok', 'YouTube', 'Otra'] as const
export type Plataforma = (typeof PLATAFORMAS)[number]

export interface Publicacion {
  id: string
  fecha: string
  titulo: string
  pilar: Pilar
  formato: Formato
  plataforma: Plataforma
  estado: Estado
  // Los resultados se llenan cuando ya está publicada. Texto: el campo puede estar vacío.
  vistas: string
  interacciones: string
}

export interface Calendario {
  cuenta: string
  /** El mes que se está viendo, como "2026-10". */
  mes: string
  publicaciones: Publicacion[]
}

export const CLAVE_GUARDADO = 'herramientas:contenido:v1'

export function publicacionVacia(fecha: string): Publicacion {
  return {
    id: nuevoId(),
    fecha,
    titulo: '',
    pilar: 'Entrenamiento',
    formato: 'Reel',
    plataforma: 'Instagram',
    estado: 'Idea',
    vistas: '',
    interacciones: '',
  }
}

export function calendarioInicial(hoy: string = hoyISO()): Calendario {
  return { cuenta: '', mes: hoy.slice(0, 7), publicaciones: [] }
}

function esPublicacion(dato: unknown): boolean {
  return (
    tieneTextos(dato, ['id', 'fecha', 'titulo', 'vistas', 'interacciones']) &&
    esObjeto(dato) &&
    esUnoDe(dato.pilar, PILARES) &&
    esUnoDe(dato.formato, FORMATOS) &&
    esUnoDe(dato.plataforma, PLATAFORMAS) &&
    esUnoDe(dato.estado, ESTADOS)
  )
}

export function esCalendario(dato: unknown): dato is Calendario {
  if (!esObjeto(dato) || !tieneTextos(dato, ['cuenta', 'mes'])) return false
  return /^\d{4}-\d{2}$/.test(dato.mes as string) && esListaDe(dato.publicaciones, esPublicacion)
}
