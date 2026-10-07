import { hoyISO } from './fecha'

/**
 * Copias de seguridad en un archivo.
 *
 * Los datos de cada herramienta viven en el navegador. Si la persona borra los datos de
 * navegación o cambia de equipo, los pierde. Con esto puede descargar una copia y volver
 * a cargarla en otro navegador.
 */

interface Respaldo<T> {
  herramienta: string
  fecha: string
  datos: T
}

export type ResultadoRespaldo<T> = { ok: true; datos: T } | { ok: false; motivo: string }

/** El texto del archivo de copia. Lleva el nombre de la herramienta para no cruzar copias. */
export function crearRespaldo<T>(herramienta: string, datos: T, fecha: string = hoyISO()): string {
  const respaldo: Respaldo<T> = { herramienta, fecha, datos }
  return JSON.stringify(respaldo, null, 2)
}

/**
 * Lee un archivo de copia y revisa que sea de esta herramienta y que los datos tengan la
 * forma esperada. Nunca lanza error: si algo falla devuelve el motivo para mostrarlo.
 */
export function leerRespaldo<T>(
  texto: string,
  herramienta: string,
  esValido: (dato: unknown) => dato is T,
): ResultadoRespaldo<T> {
  let crudo: unknown
  try {
    crudo = JSON.parse(texto)
  } catch {
    return { ok: false, motivo: 'El archivo no es una copia de estas herramientas.' }
  }

  if (
    typeof crudo !== 'object' ||
    crudo === null ||
    !('herramienta' in crudo) ||
    !('datos' in crudo)
  ) {
    return { ok: false, motivo: 'El archivo no es una copia de estas herramientas.' }
  }
  if (crudo.herramienta !== herramienta) {
    return { ok: false, motivo: 'Esta copia es de otra herramienta.' }
  }
  if (!esValido(crudo.datos)) {
    return {
      ok: false,
      motivo: 'La copia está dañada o es de una versión que ya no se puede leer.',
    }
  }
  return { ok: true, datos: crudo.datos }
}
