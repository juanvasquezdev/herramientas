import { aPositivo, redondear } from '../../shared/numero'
import type { Analisis, Costo } from './modelo'

/**
 * Las cuentas de la calculadora. Funciones puras: entra lo escrito, salen números.
 *
 * El margen siempre es sobre el precio de venta (de cada $100 que cobro, cuántos me
 * quedan), que es como lo piensa quien vende. No es el recargo sobre el costo.
 */

export interface Resultado {
  /** Lo que cuesta producir una unidad, sin contar costos fijos. */
  costoVariable: number
  costosFijos: number
  /** La parte de los costos fijos que le toca a cada unidad. */
  fijoPorUnidad: number
  costoPorUnidad: number
  precio: number
  comisionPorUnidad: number
  gananciaPorUnidad: number
  /** Porcentaje del precio que queda como ganancia. */
  margen: number
  /** Unidades que hay que vender al mes para no perder. null si con este precio nunca se llega. */
  equilibrioUnidades: number | null
  gananciaMensual: number
  ventasMensuales: number
  /** El margen pedido más la comisión dan 100 % o más: no hay precio que alcance. */
  margenImposible: boolean
  /** Hay costos fijos pero no unidades para repartirlos. */
  fijosSinRepartir: boolean
}

export function sumarCostos(costos: ReadonlyArray<Pick<Costo, 'monto'>>): number {
  return redondear(costos.reduce((suma, costo) => suma + aPositivo(costo.monto), 0))
}

export function calcular(analisis: Analisis): Resultado {
  const costoVariable = sumarCostos(analisis.variables)
  const costosFijos = sumarCostos(analisis.fijos)
  const unidades = aPositivo(analisis.unidades)
  const comision = aPositivo(analisis.comision)

  // Sin unidades no se puede repartir el costo fijo: se deja en 0 y se avisa, en vez de dividir por cero.
  const fijoPorUnidad = unidades > 0 ? costosFijos / unidades : 0
  const costoPorUnidad = costoVariable + fijoPorUnidad

  let precio = aPositivo(analisis.precio)
  let margenImposible = false
  if (analisis.modo === 'margen') {
    // precio = costo + comisión + ganancia, y las dos últimas son porcentajes del precio.
    // Despejando: precio = costo / (1 - margen - comisión).
    const loQueQuedaParaCostos = 1 - (aPositivo(analisis.margen) + comision) / 100
    margenImposible = loQueQuedaParaCostos <= 0
    precio = margenImposible ? 0 : costoPorUnidad / loQueQuedaParaCostos
  }

  const comisionPorUnidad = (precio * comision) / 100
  const gananciaPorUnidad = precio - costoPorUnidad - comisionPorUnidad

  // Lo que deja cada venta para pagar costos fijos. El punto de equilibrio sale de aquí,
  // no de la ganancia por unidad (que ya trae descontados los fijos).
  const contribucion = precio - costoVariable - comisionPorUnidad
  let equilibrioUnidades: number | null = null
  if (costosFijos === 0) equilibrioUnidades = 0
  else if (contribucion > 0)
    equilibrioUnidades = Math.ceil(redondear(costosFijos / contribucion, 6))

  return {
    costoVariable,
    costosFijos,
    fijoPorUnidad: redondear(fijoPorUnidad),
    costoPorUnidad: redondear(costoPorUnidad),
    precio: redondear(precio),
    comisionPorUnidad: redondear(comisionPorUnidad),
    gananciaPorUnidad: redondear(gananciaPorUnidad),
    margen: precio > 0 ? redondear((gananciaPorUnidad / precio) * 100, 1) : 0,
    equilibrioUnidades,
    gananciaMensual: redondear(contribucion * unidades - costosFijos),
    ventasMensuales: redondear(precio * unidades),
    margenImposible,
    fijosSinRepartir: costosFijos > 0 && unidades === 0,
  }
}
