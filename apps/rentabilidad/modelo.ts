import { nuevoId } from '../../shared/id'
import { esListaDe, esUnoDe, tieneTextos } from '../../shared/validar'

/** Lo que la persona escribe en la calculadora. Las cuentas están en calculo.ts. */

export interface Costo {
  id: string
  nombre: string
  // Texto y no número: es lo que hay escrito en el campo, que puede estar vacío.
  monto: string
}

/**
 * margen: "quiero ganar tanto, ¿a cómo vendo?".
 * precio: "ya vendo a tanto, ¿cuánto me queda?".
 */
export type Modo = 'margen' | 'precio'
const MODOS: readonly Modo[] = ['margen', 'precio']

export interface Analisis {
  producto: string
  variables: Costo[]
  fijos: Costo[]
  unidades: string
  comision: string
  modo: Modo
  margen: string
  precio: string
}

export const CLAVE_GUARDADO = 'herramientas:rentabilidad:v1'

export function costoVacio(): Costo {
  return { id: nuevoId(), nombre: '', monto: '' }
}

export function analisisInicial(): Analisis {
  return {
    producto: '',
    variables: [costoVacio()],
    fijos: [costoVacio()],
    unidades: '100',
    comision: '0',
    modo: 'margen',
    margen: '30',
    precio: '',
  }
}

const esCosto = (dato: unknown) => tieneTextos(dato, ['id', 'nombre', 'monto'])

export function esAnalisis(dato: unknown): dato is Analisis {
  if (!tieneTextos(dato, ['producto', 'unidades', 'comision', 'margen', 'precio'])) return false
  const analisis = dato as Record<string, unknown>
  return (
    esUnoDe(analisis.modo, MODOS) &&
    esListaDe(analisis.variables, esCosto, 1) &&
    esListaDe(analisis.fijos, esCosto, 1)
  )
}
