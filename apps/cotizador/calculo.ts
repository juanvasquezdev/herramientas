import { aPositivo, redondear } from '../../shared/numero'
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

/** Precio de una unidad. Vacío o negativo cuenta como 0. */
export function precioUnitario(item: Pick<Item, 'precio'>): number {
  return redondear(aPositivo(item.precio))
}

/** Cantidad por precio de una línea. Vacíos y negativos cuentan como 0. */
export function totalItem(item: Pick<Item, 'cantidad' | 'precio'>): number {
  return redondear(aPositivo(item.cantidad) * aPositivo(item.precio))
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
  const porcentaje = aPositivo(porcentajeImpuesto)
  const impuesto = redondear((subtotal * porcentaje) / 100)

  return { subtotal, impuesto, total: redondear(subtotal + impuesto) }
}
