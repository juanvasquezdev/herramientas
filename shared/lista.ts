/**
 * Operaciones sobre listas de filas con id (ítems, costos, sesiones, registros).
 * Devuelven una lista nueva y no tocan la original, que es lo que React necesita.
 */

interface ConId {
  id: string
}

/** Cambia campos de la fila con ese id. */
export function cambiarEnLista<T extends ConId>(
  lista: readonly T[],
  id: string,
  cambios: Partial<T>,
): T[] {
  return lista.map((fila) => (fila.id === id ? { ...fila, ...cambios } : fila))
}

/**
 * Quita la fila con ese id, pero nunca deja la lista con menos de `minimo` filas.
 * Casi todas las herramientas necesitan que quede al menos una fila para escribir.
 */
export function quitarDeLista<T extends ConId>(lista: readonly T[], id: string, minimo = 1): T[] {
  if (lista.length <= minimo) return [...lista]
  return lista.filter((fila) => fila.id !== id)
}
