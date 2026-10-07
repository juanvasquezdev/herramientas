import { esObjeto, esUnoDe, tieneTextos } from '../../shared/validar'
import { ANGULOS, type ClaveAngulo, type Lado } from './angulos'

/**
 * Lo único que se guarda: los ajustes y el salto de referencia. El video y los puntos
 * detectados nunca se guardan ni salen del equipo.
 */

const LADOS: readonly Lado[] = ['izquierda', 'derecha']

/** Las velocidades de grabación más comunes en celulares y cámaras. */
export const VELOCIDADES = ['24', '25', '30', '50', '60', '120', '240'] as const

export type Angulos = Record<ClaveAngulo, number>

/** Un salto que el atleta guardó para comparar los siguientes contra él. */
export interface Referencia {
  nombre: string
  apoyo: Angulos
  despegue: Angulos
  /** Segundos de contacto. null si no se midió. */
  contacto: number | null
}

export interface Ajustes {
  /** La pierna de despegue del atleta. */
  pierna: Lado
  /** Cuadros por segundo del archivo de video. */
  fps: string
  /** Cuántas veces más lento que la realidad se reproduce el video. 1 = velocidad normal. */
  camaraLenta: string
  referencia: Referencia | null
}

export const CLAVE_GUARDADO = 'herramientas:biomecanica:v1'

export function ajustesIniciales(): Ajustes {
  return { pierna: 'izquierda', fps: '30', camaraLenta: '1', referencia: null }
}

function esAngulos(dato: unknown): boolean {
  return (
    esObjeto(dato) &&
    ANGULOS.every(({ clave }) => typeof dato[clave] === 'number' && Number.isFinite(dato[clave]))
  )
}

function esReferencia(dato: unknown): boolean {
  if (dato === null) return true
  return (
    tieneTextos(dato, ['nombre']) &&
    esObjeto(dato) &&
    esAngulos(dato.apoyo) &&
    esAngulos(dato.despegue) &&
    (dato.contacto === null || typeof dato.contacto === 'number')
  )
}

export function esAjustes(dato: unknown): dato is Ajustes {
  return (
    tieneTextos(dato, ['fps', 'camaraLenta']) &&
    esObjeto(dato) &&
    esUnoDe(dato.pierna, LADOS) &&
    esReferencia(dato.referencia)
  )
}
