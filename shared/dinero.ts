/**
 * Convierte lo que viene de un <input> en número.
 *
 * Los campos numéricos se guardan como texto para que la persona pueda dejarlos vacíos
 * mientras escribe. Vacío o texto que no es número cuenta como 0.
 */
export function aNumero(valor: string | number): number {
  const numero = typeof valor === 'number' ? valor : Number(valor.trim())
  return Number.isFinite(numero) ? numero : 0
}

/**
 * Redondea a dos decimales.
 *
 * El EPSILON corrige casos como 1.005, que en coma flotante es 1.00499... y sin él
 * se redondearía hacia abajo.
 */
export function redondear(valor: number): number {
  return Math.round((valor + Number.EPSILON) * 100) / 100
}

const formato = new Intl.NumberFormat('es-CO', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/** 1190000 -> "$1.190.000,00" */
export function formatearDinero(valor: number): string {
  return `$${formato.format(valor)}`
}
