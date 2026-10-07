import { aPositivo, redondear } from '../../shared/numero'
import type { Pago } from './modelo'

/** Las cuentas de la forma de pago. */

export function sumaDePorcentajes(pagos: ReadonlyArray<Pick<Pago, 'porcentaje'>>): number {
  return redondear(pagos.reduce((suma, pago) => suma + aPositivo(pago.porcentaje), 0))
}

/**
 * Cuánto vale cada pago. Cuando los porcentajes suman 100, el último pago absorbe los
 * centavos del redondeo para que la suma dé exactamente el total (tres pagos del 33,33 %
 * sobre $1.000.000 no pueden sumar $999.999,99 en un documento que se firma).
 */
export function repartirPagos(
  total: number,
  pagos: ReadonlyArray<Pick<Pago, 'porcentaje'>>,
): number[] {
  const valores = pagos.map((pago) => redondear((total * aPositivo(pago.porcentaje)) / 100))

  if (valores.length > 0 && Math.abs(sumaDePorcentajes(pagos) - 100) < 0.05) {
    const sinElUltimo = valores.slice(0, -1).reduce((suma, valor) => suma + valor, 0)
    valores[valores.length - 1] = redondear(total - sinElUltimo)
  }
  return valores
}
