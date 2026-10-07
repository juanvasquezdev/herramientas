import { aNumero, redondear } from '../../shared/dinero'
import type { Item } from './cotizacion'

/**
 * Las cuentas de la cotización. Son funciones puras (entra un dato, sale un número) para
 * poder probarlas sin abrir el navegador.
 */

export interface Totales {
  subtotal: number
  impuesto: number
  total: number
}

/** Lo escrito en un campo como número que nunca baja de 0. */
function positivo(valor: string | number): number {
  return Math.max(0, aNumero(valor))
}

/** Precio de una unidad. Vacío o negativo cuenta como 0. */
export function precioUnitario(item: Pick<Item, 'precio'>): number {
  return redondear(positivo(item.precio))
}

/** Cantidad por precio de una línea. Vacíos y negativos cuentan como 0. */
export function totalItem(item: Pick<Item, 'cantidad' | 'precio'>): number {
  return redondear(positivo(item.cantidad) * positivo(item.precio))
}

/**
 * Subtotal, impuesto y total. Cada paso se redondea a centavos para que lo que se ve en
 * pantalla sume exacto con lo que sale en el PDF.
 */
export function calcularTotales(
  items: ReadonlyArray<Pick<Item, 'cantidad' | 'precio'>>,
  porcentajeImpuesto: string | number,
): Totales {
  const subtotal = redondear(items.reduce((suma, item) => suma + totalItem(item), 0))
  const porcentaje = positivo(porcentajeImpuesto)
  const impuesto = redondear((subtotal * porcentaje) / 100)

  return { subtotal, impuesto, total: redondear(subtotal + impuesto) }
}
