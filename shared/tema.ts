/**
 * El tema del sitio: claro u oscuro.
 *
 * Mientras la persona no elija, se sigue el del equipo. Cuando elige, su elección queda
 * guardada y manda. La misma regla está escrita en index.html, en un script que corre
 * antes de pintar la página para que no se vea un destello del tema equivocado: si se
 * cambia aquí, hay que cambiarla allá.
 */

export type Tema = 'claro' | 'oscuro'

export const CLAVE_TEMA = 'herramientas:tema:v1'

export function esTema(valor: unknown): valor is Tema {
  return valor === 'claro' || valor === 'oscuro'
}

/** `guardado` es lo que hay en el navegador, tal cual: puede ser nulo o cualquier texto. */
export function temaInicial(guardado: string | null, elEquipoPrefiereOscuro: boolean): Tema {
  if (esTema(guardado)) return guardado
  return elEquipoPrefiereOscuro ? 'oscuro' : 'claro'
}

export function otroTema(tema: Tema): Tema {
  return tema === 'claro' ? 'oscuro' : 'claro'
}
