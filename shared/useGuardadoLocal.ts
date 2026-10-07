import { useEffect, useState, type Dispatch, type SetStateAction } from 'react'
import { almacenDelNavegador, guardar, leer } from './almacen'

/**
 * Igual que useState, pero el valor queda guardado en el navegador y vuelve al recargar.
 *
 * `clave` lleva el nombre de la herramienta y una versión, por ejemplo
 * "herramientas:cotizador:v1". Si cambia la forma de los datos se sube la versión y
 * lo viejo simplemente se ignora.
 */
export function useGuardadoLocal<T>(
  clave: string,
  inicial: () => T,
  esValido?: (dato: unknown) => dato is T,
): [T, Dispatch<SetStateAction<T>>] {
  const [valor, setValor] = useState<T>(() =>
    leer(almacenDelNavegador(), clave, inicial(), esValido),
  )

  useEffect(() => {
    guardar(almacenDelNavegador(), clave, valor)
  }, [clave, valor])

  return [valor, setValor]
}
