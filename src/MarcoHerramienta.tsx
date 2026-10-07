import { useMemo } from 'react'
import { ContextoIdentidad } from '../shared/identidad'
import { type Herramienta, NOMBRE_DE_CATEGORIA } from './herramientas'

interface Props {
  herramienta: Herramienta
}

/**
 * Lo que rodea a cada herramienta: le pasa su identidad (categoría e ícono) para que el
 * encabezado la pinte. El color de la categoría lo pone el Marco en toda la página.
 */
export function MarcoHerramienta({ herramienta }: Props) {
  const { categoria, Icono, Pantalla } = herramienta
  const identidad = useMemo(
    () => ({ categoria: NOMBRE_DE_CATEGORIA[categoria], Icono }),
    [categoria, Icono],
  )

  return (
    <ContextoIdentidad value={identidad}>
      <Pantalla />
    </ContextoIdentidad>
  )
}
