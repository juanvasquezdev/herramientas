import { aPositivo, porcentajeDe, redondear } from '../../shared/numero'
import { DIAS, type Dia, type Ejercicio, type Medida, type Semana } from './modelo'

/**
 * Las cuentas del plan. Dos medidas, las que se usan en una sala de pesas:
 * - repeticiones = series × reps
 * - tonelaje     = series × reps × kg (los kilos movidos en total)
 *
 * No hay "alertas de sobreentrenamiento" calculadas con una fórmula: eso depende del
 * atleta y lo decide el entrenador. Aquí solo se muestran los números y, si él fija un
 * tope de subida semanal, se avisa cuando se pasa.
 */

export function repeticionesDe(ejercicio: Pick<Ejercicio, 'series' | 'reps'>): number {
  return aPositivo(ejercicio.series) * aPositivo(ejercicio.reps)
}

export function tonelajeDe(ejercicio: Pick<Ejercicio, 'series' | 'reps' | 'kg'>): number {
  return redondear(repeticionesDe(ejercicio) * aPositivo(ejercicio.kg))
}

export function cargaDe(ejercicio: Ejercicio, medida: Medida): number {
  return medida === 'tonelaje' ? tonelajeDe(ejercicio) : repeticionesDe(ejercicio)
}

export interface CargaDelDia {
  dia: Dia
  carga: number
  /** Qué parte de la semana se hace ese día, en %. */
  porcentaje: number
}

export interface ResumenSemana {
  total: number
  porDia: CargaDelDia[]
  diasDeEntrenamiento: number
  /** El día con más carga. null si la semana está vacía. */
  diaMasCargado: CargaDelDia | null
  /** Kilos por repetición en promedio: una idea rápida de qué tan pesada fue la semana. */
  pesoMedio: number
}

export function resumirSemana(semana: Semana, medida: Medida): ResumenSemana {
  const total = redondear(
    semana.ejercicios.reduce((suma, ejercicio) => suma + cargaDe(ejercicio, medida), 0),
  )

  const porDia = DIAS.map((dia) => {
    const carga = redondear(
      semana.ejercicios
        .filter((e) => e.dia === dia)
        .reduce((suma, e) => suma + cargaDe(e, medida), 0),
    )
    return { dia, carga, porcentaje: redondear(porcentajeDe(carga, total), 0) }
  })

  const conCarga = porDia.filter((dia) => dia.carga > 0)
  // Para el peso medio solo cuentan los ejercicios con carga: las repeticiones de saltos o
  // autocargas no llevan kilos y bajarían el promedio sin razón.
  const conPeso = semana.ejercicios.filter((e) => tonelajeDe(e) > 0)
  const repeticiones = conPeso.reduce((suma, e) => suma + repeticionesDe(e), 0)
  const tonelaje = conPeso.reduce((suma, e) => suma + tonelajeDe(e), 0)

  return {
    total,
    porDia,
    diasDeEntrenamiento: conCarga.length,
    diaMasCargado: conCarga.reduce<CargaDelDia | null>(
      (mayor, dia) => (!mayor || dia.carga > mayor.carga ? dia : mayor),
      null,
    ),
    pesoMedio: repeticiones > 0 ? redondear(tonelaje / repeticiones, 1) : 0,
  }
}

export interface Comparacion {
  diferencia: number
  /** Cambio en % frente a la semana anterior. Positivo = subió. */
  porcentaje: number
}

/** Cuánto cambió la carga frente a la semana anterior. null si no hay con qué comparar. */
export function comparar(actual: number, anterior: number | undefined): Comparacion | null {
  if (anterior === undefined || anterior <= 0) return null
  return {
    diferencia: redondear(actual - anterior),
    porcentaje: redondear(((actual - anterior) / anterior) * 100, 0),
  }
}

/** ¿La subida pasa el tope que fijó el entrenador? Sin tope escrito nunca avisa. */
export function superaElTope(comparacion: Comparacion | null, tope: string): boolean {
  if (!comparacion || tope.trim() === '') return false
  return comparacion.porcentaje > aPositivo(tope)
}
