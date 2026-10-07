import { type Almacen, leer } from './almacen'
import { esObjeto, tieneTextos } from './validar'

/**
 * Los datos de quien usa las herramientas (su empresa o su nombre). Se llenan una vez y
 * los comparten el cotizador y la propuesta, para no escribirlos en cada una.
 */
export interface Perfil {
  nombre: string
  correo: string
  telefono: string
}

export const CLAVE_PERFIL = 'herramientas:perfil:v1'

export function perfilVacio(): Perfil {
  return { nombre: '', correo: '', telefono: '' }
}

export function esPerfil(dato: unknown): dato is Perfil {
  return tieneTextos(dato, ['nombre', 'correo', 'telefono'])
}

/**
 * La primera versión del cotizador guardaba estos datos dentro de la cotización, con el
 * correo en un campo llamado "contacto". Si alguien ya los había llenado, se rescatan.
 */
export function perfilDelCotizadorViejo(dato: unknown): Perfil | null {
  if (!esObjeto(dato) || !esObjeto(dato.empresa)) return null
  const { nombre, contacto, telefono } = dato.empresa
  if (typeof nombre !== 'string' || typeof contacto !== 'string' || typeof telefono !== 'string')
    return null
  return { nombre, correo: contacto, telefono }
}

/** El perfil con el que arranca alguien que todavía no tiene uno guardado. */
export function perfilDeArranque(almacen: Almacen | null): Perfil {
  const viejo = leer<unknown>(almacen, 'herramientas:cotizador:v1', null)
  return perfilDelCotizadorViejo(viejo) ?? perfilVacio()
}
