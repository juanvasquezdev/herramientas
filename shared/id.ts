/**
 * Id para las filas de una lista (ítems, costos, registros).
 *
 * crypto.randomUUID solo existe en contextos seguros (https o localhost). Si abro el sitio
 * desde el celular por la IP de la red local no está disponible, por eso el respaldo.
 */
export function nuevoId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return Math.random().toString(36).slice(2, 11)
}
