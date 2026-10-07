import { hoyISO } from '../../shared/fecha'
import { nuevoId } from '../../shared/id'
import { esListaDe, tieneTextos } from '../../shared/validar'
import { PRUEBA_INICIAL } from './pruebas'

/** La bitácora de un atleta: sus datos y todas sus marcas, de todas las pruebas. */

export interface Registro {
  id: string
  /** El id de la prueba en pruebas.ts. */
  prueba: string
  fecha: string
  /** Lo que la persona escribió: "2,06" o "1:52,45". Se convierte al calcular. */
  marca: string
  /** Competencia o lugar, o una nota corta. */
  lugar: string
}

export interface Bitacora {
  atleta: string
  entrenador: string
  /** La prueba que se está viendo. */
  pruebaActiva: string
  registros: Registro[]
}

export const CLAVE_GUARDADO = 'herramientas:marcas:v1'

export function registroVacio(prueba: string, hoy: string = hoyISO()): Registro {
  return { id: nuevoId(), prueba, fecha: hoy, marca: '', lugar: '' }
}

export function bitacoraInicial(): Bitacora {
  return { atleta: '', entrenador: '', pruebaActiva: PRUEBA_INICIAL, registros: [] }
}

export function esBitacora(dato: unknown): dato is Bitacora {
  if (!tieneTextos(dato, ['atleta', 'entrenador', 'pruebaActiva'])) return false
  const { registros } = dato as Record<string, unknown>
  // Aquí la lista sí puede estar vacía: alguien que apenas abre la herramienta no tiene marcas.
  return esListaDe(registros, (r) => tieneTextos(r, ['id', 'prueba', 'fecha', 'marca', 'lugar']))
}
