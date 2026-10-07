import type { LucideIcon } from 'lucide-react'
import { createContext, useContext } from 'react'

/** Lo que identifica a la herramienta que está abierta: su categoría y su ícono. */
export interface Identidad {
  categoria: string
  Icono: LucideIcon
}

/**
 * El sitio le cuenta a cada herramienta cuál es su identidad, y el encabezado la pinta.
 * Así ninguna herramienta tiene que saber en qué categoría quedó ni qué ícono le tocó:
 * eso se decide en un solo lugar, el registro.
 */
export const ContextoIdentidad = createContext<Identidad | null>(null)

export function useIdentidad(): Identidad | null {
  return useContext(ContextoIdentidad)
}
