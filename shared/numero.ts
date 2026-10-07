/**
 * Convierte lo que viene de un <input> en número.
 *
 * Los campos numéricos se guardan como texto para que la persona pueda dejarlos vacíos
 * mientras escribe. Vacío o texto que no es número cuenta como 0. Acepta coma decimal.
 */
export function aNumero(valor: string | number): number {
  const numero = typeof valor === 'number' ? valor : Number(valor.trim().replace(',', '.'))
  return Number.isFinite(numero) ? numero : 0
}

/** Igual que aNumero, pero nunca baja de 0. */
export function aPositivo(valor: string | number): number {
  return Math.max(0, aNumero(valor))
}

/**
 * Redondea a `decimales` cifras (dos por defecto).
 *
 * El EPSILON corrige casos como 1.005, que en coma flotante es 1.00499... y sin él
 * se redondearía hacia abajo.
 */
export function redondear(valor: number, decimales = 2): number {
  const factor = 10 ** decimales
  return Math.round((valor + Number.EPSILON) * factor) / factor
}

/** Qué porcentaje es `parte` de `total`. Si el total es 0 devuelve 0 en vez de dividir por cero. */
export function porcentajeDe(parte: number, total: number): number {
  return total === 0 ? 0 : (parte / total) * 100
}

/** 1234.5 -> "1.234,5". Sin decimales de relleno. */
export function formatearNumero(valor: number, decimales = 2): string {
  return valor.toLocaleString('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimales,
  })
}
