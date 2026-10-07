/**
 * Leer y guardar datos en el navegador.
 *
 * Está separado del hook para poder probarlo sin navegador: las funciones reciben el
 * almacén por parámetro y en las pruebas se les pasa uno de mentira.
 */

/** Lo mínimo de localStorage que se usa aquí. */
export interface Almacen {
  getItem(clave: string): string | null
  setItem(clave: string, valor: string): void
}

/**
 * Devuelve lo guardado en `clave`, o `inicial` si no hay nada o si lo guardado no sirve
 * (JSON dañado o con una forma vieja). `esValido` revisa la forma del dato.
 */
export function leer<T>(
  almacen: Almacen | null,
  clave: string,
  inicial: T,
  esValido?: (dato: unknown) => dato is T,
): T {
  if (!almacen) return inicial
  try {
    const crudo = almacen.getItem(clave)
    if (crudo === null) return inicial

    const dato: unknown = JSON.parse(crudo)
    if (esValido && !esValido(dato)) return inicial
    return dato as T
  } catch {
    return inicial
  }
}

/** Guarda `valor` en `clave`. Devuelve false si no se pudo (sin almacén o sin espacio). */
export function guardar(almacen: Almacen | null, clave: string, valor: unknown): boolean {
  if (!almacen) return false
  try {
    almacen.setItem(clave, JSON.stringify(valor))
    return true
  } catch {
    return false
  }
}

/** localStorage, o null si el navegador lo tiene bloqueado (pasa en algunas ventanas privadas). */
export function almacenDelNavegador(): Almacen | null {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null
  } catch {
    return null
  }
}
